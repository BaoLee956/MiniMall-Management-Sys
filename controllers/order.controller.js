import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import OrderDetail from '../models/orderDetail.model.js';
import Inventory from '../models/inventory.model.js';
import Product from '../models/product.model.js';

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const { paymentMethod, items, customerId, cashierId } = req.body;

      if (!paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Phương thức thanh toán và danh sách sản phẩm là bắt buộc');
      }

      if (!cashierId) {
        throw new Error('Thông tin thu ngân là bắt buộc');
      }

      let totalAmount = 0;

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw new Error('Mỗi sản phẩm phải có mã sản phẩm và số lượng hợp lệ');
        }

        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại`);
        }

        item.unitPrice = product.retailPrice;
        item.subTotal = product.retailPrice * item.quantity;
        totalAmount += item.subTotal;
      }

      const [order] = await Order.create(
        [
          {
            totalAmount,
            paymentMethod,
            cashierId,
            customerId: customerId || null,
            status: 'COMPLETED',
          },
        ],
        { session }
      );

      const orderDetailDocs = items.map((item) => ({
        orderId: order._id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subTotal: item.subTotal,
      }));

      await OrderDetail.insertMany(orderDetailDocs, { session });

      for (const item of items) {
        let remainingQty = item.quantity;

        const batches = await Inventory.find({
          productId: item.productId,
          quantity: { $gt: 0 },
        })
          .sort({ expirationDate: 1, importedAt: 1 })
          .session(session);

        const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

        if (totalStock < remainingQty) {
          const product = await Product.findById(item.productId).session(session);
          throw new Error(
            `Số lượng tồn kho không đủ cho sản phẩm "${product.name}". Tồn kho hiện tại: ${totalStock}, yêu cầu: ${remainingQty}`
          );
        }

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const deduct = Math.min(batch.quantity, remainingQty);
          batch.quantity -= deduct;
          remainingQty -= deduct;

          await batch.save({ session });
        }
      }

      createdOrder = order;
    });

    const details = await OrderDetail.find({ orderId: createdOrder._id }).populate(
      'productId',
      'name barcode retailPrice'
    );

    return res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: { order: createdOrder, details },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi máy chủ, không thể tạo hóa đơn',
      data: null,
    });
  } finally {
    session.endSession();
  }
};

export const getDailyOrders = async (req, res) => {
  try {
    const { date } = req.query;

    let targetDate = date ? new Date(date) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng ngày không hợp lệ. Vui lòng dùng định dạng YYYY-MM-DD',
        data: null,
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'COMPLETED',
    })
      .populate('cashierId', 'fullName')
      .populate('customerId', 'fullName phone')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return res.status(200).json({
      success: true,
      message: `Danh sách hóa đơn ngày ${targetDate.toLocaleDateString('vi-VN')}`,
      data: { totalRevenue, totalOrders: orders.length, orders },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể lấy danh sách hóa đơn trong ngày',
      data: null,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('cashierId', 'fullName')
      .populate('customerId', 'fullName phone rewardPoints');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Hóa đơn không tồn tại',
        data: null,
      });
    }

    const details = await OrderDetail.find({ orderId: id }).populate(
      'productId',
      'name barcode retailPrice'
    );

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết hóa đơn thành công',
      data: { order, details },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID hóa đơn không hợp lệ',
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể lấy chi tiết hóa đơn',
      data: null,
    });
  }
};

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let updatedOrder;

    await session.withTransaction(async () => {
      const { id } = req.params;

      const order = await Order.findById(id).session(session);
      if (!order) {
        throw new Error('Hóa đơn không tồn tại');
      }

      if (order.status === 'CANCELLED') {
        throw new Error('Hóa đơn này đã được hủy trước đó');
      }

      const details = await OrderDetail.find({ orderId: id }).session(session);

      for (const detail of details) {
        const latestBatch = await Inventory.findOne({ productId: detail.productId })
          .sort({ importedAt: -1 })
          .session(session);

        if (latestBatch) {
          latestBatch.quantity += detail.quantity;
          await latestBatch.save({ session });
        } else {
          await Inventory.create(
            [
              {
                productId: detail.productId,
                batchCode: `HOAN-${order._id}`,
                quantity: detail.quantity,
                costPrice: detail.unitPrice,
              },
            ],
            { session }
          );
        }
      }

      order.status = 'CANCELLED';
      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: 'Hủy hóa đơn và hoàn trả tồn kho thành công',
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi máy chủ, không thể hủy hóa đơn',
      data: null,
    });
  } finally {
    session.endSession();
  }
};

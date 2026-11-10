import mongoose from 'mongoose';
import Inventory from '../models/inventory.model.js';
import Product from '../models/product.model.js';

export const importInventory = async (req, res) => {
  try {
    const { productId, batchCode, quantity, costPrice, expirationDate } = req.body;

    if (!productId || !batchCode || quantity === undefined || costPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Mã sản phẩm, mã lô hàng, số lượng và giá nhập là bắt buộc',
        data: null,
      });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại',
        data: null,
      });
    }

    const batch = await Inventory.create({
      productId,
      batchCode,
      quantity,
      costPrice,
      expirationDate: expirationDate || null,
    });

    const populated = await batch.populate('productId', 'name barcode');

    return res.status(201).json({
      success: true,
      message: 'Nhập kho thành công',
      data: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(', '),
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể thực hiện nhập kho',
      data: null,
    });
  }
};

export const getExpiringBatches = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const batches = await Inventory.find({
      expirationDate: { $ne: null, $lte: targetDate },
      quantity: { $gt: 0 },
    })
      .populate('productId', 'name barcode retailPrice')
      .sort({ expirationDate: 1 });

    return res.status(200).json({
      success: true,
      message: `Danh sách lô hàng sắp hết hạn trong ${days} ngày tới`,
      data: batches,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể lấy danh sách lô hàng sắp hết hạn',
      data: null,
    });
  }
};

export const getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.query;

    const filter = { quantity: { $gt: 0 } };
    if (productId) {
      filter.productId = productId;
    }

    const batches = await Inventory.find(filter)
      .populate('productId', 'name barcode retailPrice')
      .sort({ expirationDate: 1, importedAt: 1 });

    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin tồn kho thành công',
      data: { totalStock, batches },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể lấy thông tin tồn kho',
      data: null,
    });
  }
};

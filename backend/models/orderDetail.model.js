import mongoose from 'mongoose';

const orderDetailSchema = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng phải lớn hơn 0'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Đơn giá là bắt buộc'],
      min: [0, 'Đơn giá không được âm'],
    },
    subTotal: {
      type: Number,
      required: [true, 'Thành tiền là bắt buộc'],
      min: [0, 'Thành tiền không được âm'],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Hóa đơn là bắt buộc'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Sản phẩm là bắt buộc'],
    },
  },
  { timestamps: false }
);

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);

export default OrderDetail;

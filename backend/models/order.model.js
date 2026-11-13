import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: [true, 'Tổng tiền là bắt buộc'],
      min: [0, 'Tổng tiền không được âm'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Phương thức thanh toán là bắt buộc'],
      enum: {
        values: ['CASH', 'CARD', 'TRANSFER', 'BANKING', 'MOMO'],
        message: 'Phương thức thanh toán không hợp lệ',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['COMPLETED', 'CANCELLED'],
        message: 'Trạng thái đơn hàng không hợp lệ',
      },
      default: 'COMPLETED',
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Thu ngân là bắt buộc'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;

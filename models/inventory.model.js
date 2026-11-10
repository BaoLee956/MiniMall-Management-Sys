import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    batchCode: {
      type: String,
      required: [true, 'Mã lô hàng là bắt buộc'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng nhập kho là bắt buộc'],
      min: [0, 'Số lượng không được âm'],
    },
    costPrice: {
      type: Number,
      required: [true, 'Giá nhập là bắt buộc'],
      min: [0, 'Giá nhập không được âm'],
    },
    expirationDate: {
      type: Date,
      default: null,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Sản phẩm là bắt buộc'],
    },
  },
  { timestamps: false }
);

inventorySchema.index({ productId: 1, expirationDate: 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;

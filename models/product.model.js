import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: [true, 'Mã vạch sản phẩm là bắt buộc'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    retailPrice: {
      type: Number,
      required: [true, 'Giá bán lẻ là bắt buộc'],
      min: [0, 'Giá bán lẻ không được âm'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục sản phẩm là bắt buộc'],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;

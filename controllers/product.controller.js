import Product from '../models/product.model.js';
import Category from '../models/category.model.js';

export const getAllProducts = async (req, res) => {
  try {
    const { categoryId, search } = req.query;

    const filter = {};

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('categoryId', 'name description')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể lấy danh sách sản phẩm',
      data: null,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { barcode, name, retailPrice, categoryId, imageUrl } = req.body;

    if (!barcode || !name || retailPrice === undefined || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Mã vạch, tên sản phẩm, giá bán lẻ và danh mục là bắt buộc',
        data: null,
      });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Danh mục không tồn tại',
        data: null,
      });
    }

    const product = await Product.create({ barcode, name, retailPrice, categoryId, imageUrl });

    const populated = await product.populate('categoryId', 'name description');

    return res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm mới thành công',
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Mã vạch sản phẩm đã tồn tại trong hệ thống',
        data: null,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(', '),
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể tạo sản phẩm',
      data: null,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = ['name', 'retailPrice', 'categoryId', 'imageUrl', 'isActive', 'barcode'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.categoryId) {
      const categoryExists = await Category.findById(updateData.categoryId);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Danh mục không tồn tại',
          data: null,
        });
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Mã vạch sản phẩm đã tồn tại trong hệ thống',
        data: null,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(', '),
        data: null,
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ',
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể cập nhật sản phẩm',
      data: null,
    });
  }
};

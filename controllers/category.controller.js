import Category from '../models/category.model.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, không thể lấy danh sách danh mục',
      data: null,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục là bắt buộc',
        data: null,
      });
    }

    const category = await Category.create({ name, description });

    return res.status(201).json({
      success: true,
      message: 'Tạo danh mục mới thành công',
      data: category,
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
      message: 'Lỗi máy chủ, không thể tạo danh mục',
      data: null,
    });
  }
};

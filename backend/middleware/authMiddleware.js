import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực hoặc định dạng không hợp lệ',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      data: null,
    });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền quản trị',
        data: null,
      });
    }
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi kiểm tra quyền',
      data: null,
    });
  }
};

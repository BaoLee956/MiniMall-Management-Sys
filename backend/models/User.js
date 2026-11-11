import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Tên đăng nhập là bắt buộc'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
    },
    role: {
      type: String,
      enum: {
        values: ['Admin', 'Cashier'],
        message: 'Vai trò phải là Admin hoặc Cashier',
      },
      default: 'Cashier',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;

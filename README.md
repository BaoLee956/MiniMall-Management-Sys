# MiniMall Management System

Hệ thống quản lý chuỗi cửa hàng tiện lợi MiniMall, bao gồm hai phân hệ chính:
- **Backend:** Xây dựng bằng Node.js, Express và MongoDB Atlas.
- **Frontend:** Giao diện ứng dụng người dùng (Thu ngân & Quản lý).

---

## Cấu trúc tổng thể dự án

```
.
├── backend/                        # Toàn bộ mã nguồn máy chủ & API
│   ├── config/                     # Cấu hình kết nối cơ sở dữ liệu
│   │   └── db.js
│   ├── controllers/                # Logic điều khiển cho từng phân hệ
│   │   ├── category.controller.js
│   │   ├── product.controller.js
│   │   ├── inventory.controller.js
│   │   └── order.controller.js
│   ├── models/                     # Data Schema Mongoose
│   │   ├── category.model.js
│   │   ├── product.model.js
│   │   ├── inventory.model.js
│   │   ├── order.model.js
│   │   └── orderDetail.model.js
│   ├── routes/                     # Định tuyến API
│   │   ├── category.routes.js
│   │   ├── product.routes.js
│   │   ├── inventory.routes.js
│   │   └── order.routes.js
│   ├── test/                       # Kịch bản kiểm thử tự động
│   │   ├── test-api.js
│   │   └── test-order.js
│   ├── .env.example                # Mẫu biến môi trường Backend
│   ├── package.json                # Dependencies & scripts của Backend
│   └── server.js                   # Entry point của Express server
│
├── frontend/                       # Mã nguồn giao diện người dùng
│   └── README.md
│
├── .gitignore                      # Cấu hình bỏ qua các tệp nhạy cảm
└── README.md                       # Tài liệu tổng quan dự án
```

---

## Hướng dẫn khởi chạy Backend

### 1. Di chuyển vào thư mục Backend
```bash
cd backend
```

### 2. Cài đặt thư viện dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/minipos?retryWrites=true&w=majority
```

### 4. Khởi động Backend
```bash
# Môi trường phát triển
npm run dev

# Môi trường chạy trực tiếp
npm start
```

### 5. Chạy kiểm thử tự động
```bash
# Chạy toàn bộ các bài test
npm test

# Chạy riêng kiểm thử hàng hóa & danh mục
npm run test:catalog

# Chạy riêng kiểm thử đặt hàng, trừ tồn kho và rollback
npm run test:order
```

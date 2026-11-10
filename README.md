# MiniMall Management System (MiniPOS Backend)

Hệ thống Backend quản lý bán hàng và kho hàng cho chuỗi cửa hàng tiện lợi MiniMall, được xây dựng trên nền tảng Node.js, Express và MongoDB (Mongoose).

## Công nghệ sử dụng

- **Runtime:** Node.js (ES6+ Modules)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Transaction:** Mongoose Session with Multi-document ACID Transaction
- **Kiểm thử API:** Native `fetch` (Node.js 18+)

## Cấu trúc thư mục

```
├── config/
│   └── db.js                       # Cấu hình kết nối MongoDB Atlas
├── controllers/
│   ├── category.controller.js      # Xử lý danh mục sản phẩm
│   ├── product.controller.js       # Xử lý hàng hóa sản phẩm
│   ├── inventory.controller.js     # Xử lý nhập kho và FEFO
│   └── order.controller.js         # Xử lý đơn hàng và trừ kho tự động
├── models/
│   ├── category.model.js           # Schema Categories
│   ├── product.model.js            # Schema Products
│   ├── inventory.model.js          # Schema Inventory (quản lý lô và hạn sử dụng)
│   ├── order.model.js              # Schema Orders
│   └── orderDetail.model.js        # Schema OrderDetails
├── routes/
│   ├── category.routes.js          # Route /api/categories
│   ├── product.routes.js           # Route /api/products
│   ├── inventory.routes.js         # Route /api/inventory
│   └── order.routes.js             # Route /api/orders
├── .env.example                    # Mẫu biến môi trường
├── package.json                    # Cấu hình dự án và dependencies
├── server.js                       # Entry point máy chủ Express
├── test-api.js                     # Script kiểm thử phân hệ Hàng hóa & Danh mục
└── test-order.js                   # Script kiểm thử phân hệ Bán hàng & Trừ kho
```

## Hướng dẫn cài đặt & khởi chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình biến môi trường

Tạo file `.env` từ `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/minipos?retryWrites=true&w=majority
```

### 3. Chạy máy chủ

```bash
# Môi trường phát triển (tự reload khi đổi file)
npm run dev

# Môi trường chạy trực tiếp
npm start
```

### 4. Kiểm thử API tự động

- **Kiểm thử danh mục và sản phẩm:**
  ```bash
  node test-api.js
  ```
- **Kiểm thử đặt hàng, trừ tồn kho và rollback:**
  ```bash
  node test-order.js
  ```

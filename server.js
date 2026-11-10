import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Máy chủ MiniPOS đang hoạt động bình thường.');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Máy chủ đang lắng nghe tại cổng ${PORT}`);
});

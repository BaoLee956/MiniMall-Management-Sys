import express from 'express';
import {
  createOrder,
  getDailyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/order.controller.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/daily', getDailyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', cancelOrder);

export default router;

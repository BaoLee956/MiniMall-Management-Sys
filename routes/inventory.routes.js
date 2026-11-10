import express from 'express';
import {
  importInventory,
  getExpiringBatches,
  getInventoryByProduct,
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.post('/import', importInventory);
router.get('/fefo', getExpiringBatches);
router.get('/', getInventoryByProduct);

export default router;

import express from 'express';
import { getAllProducts, createProduct, updateProduct } from '../controllers/product.controller.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);

export default router;

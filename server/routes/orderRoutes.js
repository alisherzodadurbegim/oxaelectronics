import express from 'express'
import {
	createOrder,
	getAllOrders,
	updateOrderStatus,
} from '../controllers/orderController.js'
import { admin, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Bütün siparişleri alma (admin)
router.get('/', protect, admin, getAllOrders)

// Sipariş durumunu güncelleme (admin)
router.put('/:id/status', protect, admin, updateOrderStatus)
export default router

router.post('/', protect, createOrder)

import express from 'express'
import {
	createProduct,
	deleteProduct,
	updateProduct,
} from '../controllers/productController.js'
import { admin, protect } from '../middleware/authMiddleware.js'
import User from '../models/User.js'
const router = express.Router()

router.get('/dashboard', protect, admin, (req, res) => {
	res.json({ message: 'Welcome Admin!', user: req.user })
})
// router.get('/products', protect, admin, getAllProducts)
// Ürün eklemek
router.post('/products', protect, admin, createProduct)

// Ürünü silmek
router.delete('/products/:id', protect, admin, deleteProduct)

// Ürünü güncellemek
router.put('/products/:id', protect, admin, updateProduct)

// Tüm kullanıcıları alma (admin)
router.get('/users', protect, admin, async (req, res) => {
	try {
		const users = await User.find().select('-password')
		res.json(users)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Server error' })
	}
})
export default router

import express from 'express'
import {
	addToCart,
	getCart,
	removeFromCart,
} from '../controllers/cartController.js'

const router = express.Router()

router.post('/add', addToCart)
router.get('/', getCart)
router.delete('/remove/:productId', removeFromCart)

export default router

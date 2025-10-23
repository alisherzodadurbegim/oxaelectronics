import Cart from '../models/Cart.js'

export const addToCart = async (req, res) => {
	try {
		const { userId, productId, quantity } = req.body

		// Avval tekshirish
		let cart = await Cart.findOne({ userId })

		if (!cart) {
			cart = await Cart.create({
				userId,
				items: [{ productId, quantity: Number(quantity) }],
			})
		} else {
			const existing = cart.items.find(
				item => item.productId.toString() === productId
			)

			if (existing) {
				// quantityni aniq qiymatga o‘rnatamiz
				await Cart.updateOne(
					{ userId, 'items.productId': productId },
					{ $set: { 'items.$.quantity': Number(quantity) } }
				)
			} else {
				await Cart.updateOne(
					{ userId },
					{ $push: { items: { productId, quantity: Number(quantity) } } }
				)
			}

			cart = await Cart.findOne({ userId }).populate('items.productId')
		}

		res.status(200).json(cart)
	} catch (err) {
		console.error('Add to cart error:', err)
		res.status(500).json({ message: 'Add to cart failed', error: err.message })
	}
}

export const getCart = async (req, res) => {
	const { userId } = req.query
	try {
		const cart = await Cart.findOne({ userId }).populate('items.productId')
		res.status(200).json(cart || { items: [] })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

export const removeFromCart = async (req, res) => {
	const { userId } = req.body
	const { productId } = req.params

	try {
		const cart = await Cart.findOne({ userId })
		if (!cart) return res.status(404).json({ message: 'Cart not found' })

		cart.items = cart.items.filter(i => i.productId.toString() !== productId)
		await cart.save()
		const populatedCart = await cart.populate('items.productId')
		res.status(200).json(populatedCart)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

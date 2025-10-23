import axios from 'axios'
import Order from '../models/Orders.js'

export const getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find().populate(
			'userId',
			'firstName lastName email'
		)
		res.json(orders)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

export const updateOrderStatus = async (req, res) => {
	const { status } = req.body
	try {
		const order = await Order.findByIdAndUpdate(
			req.params.id,
			{ status },
			{ new: true }
		)
		if (!order) return res.status(404).json({ msg: 'Order not found' })
		res.json(order)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

export const createOrder = async (req, res) => {
	try {
		const userId = req.user?._id || req.user?.id

		if (!userId) {
			return res.status(401).json({ msg: 'Unauthorized. User ID missing' })
		}

		const { customer, items, subtotal, shipping, tax, total, paymentMethod } =
			req.body

		if (!items || items.length === 0) {
			return res.status(400).json({ msg: 'Cart is empty' })
		}

		const order = new Order({
			userId: userId,
			items,
			shippingAddress: {
				firstName: customer.firstName,
				lastName: customer.lastName,
				address: customer.address,
				city: customer.city,
				zipCode: customer.postalCode,
				country: customer.country || '',
				phone: customer.phone,
			},
			subtotal,
			shipping,
			tax,
			total,
			paymentMethod,
			paymentStatus: 'pending',
			status: 'pending',
		})

		const savedOrder = await order.save()

		// ✅ Telegramga yuborish
		const botToken = process.env.TELEGRAM_BOT_TOKEN
		const chatIds = process.env.TELEGRAM_CHAT_IDS.split(',') // [id1, id2, id3]

		const message = `
🛍️ *Yangi Buyurtma!*
👤 ${customer.firstName} ${customer.lastName}
📞 ${customer.phone}
📍 ${customer.address}, ${customer.city}

🧾 *To‘lov turi:* ${paymentMethod}
💰 *Jami summa:* ${total} so‘m
📦 *Mahsulotlar:*
${items.map(item => `- ${item.name} (${item.quantity}x)`).join('\n')}
`

		// 🔁 Har bir ID ga yuborish
		for (const chatId of chatIds) {
			await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
				chat_id: chatId.trim(),
				text: message,
				parse_mode: 'Markdown',
			})
		}

		res.status(201).json(savedOrder)
	} catch (err) {
		console.error('Order create error:', err)
		res.status(500).json({ error: err.message })
	}
}

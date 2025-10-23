import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		items: [
			{
				productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
				name: String,
				price: Number,
				quantity: Number,
			},
		],
		shippingAddress: {
			firstName: String,
			lastName: String,
			address: String,
			city: String,
			state: String,
			zipCode: String,
			country: String,
			phone: String,
		},
		subtotal: Number,
		shipping: Number,
		tax: Number,
		total: Number,
		paymentMethod: String,
		paymentStatus: { type: String, default: 'pending' },
		status: { type: String, default: 'pending' }, // pending | shipped | delivered
	},
	{ timestamps: true }
)

export default mongoose.models.Order || mongoose.model('Order', orderSchema)

import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		category: {
			type: String,
			required: true,
			enum: ['Electronics', 'Optoelectronics', 'Sensors', 'SMD', 'Other'],
			default: 'Other',
		},
		image: {
			type: String,
			default: '/diverse-products-still-life.png',
		},
		stock: {
			type: Number,
			required: true,
			min: 0,
		},
		featured: {
			type: Boolean,
			default: false,
		},
		rating: {
			type: Number,
			default: 4.5,
			min: 0,
			max: 5,
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
	},
	{ timestamps: true }
)

export default mongoose.models.Product ||
	mongoose.model('Product', productSchema)

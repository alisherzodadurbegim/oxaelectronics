import Product from '../models/Product.js'

// 1.Tüm ürünleri almak
export async function getAllProducts(req, res) {
	try {
		const products = await Product.find()
		res.json(products)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

//  2.Tek bir ürünü almak
export async function getProductById(req, res) {
	try {
		const product = await Product.findById(req.params.id)
		if (!product) return res.status(404).json({ msg: 'Mahsulot topilmadi' })
		res.json(product)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

// 3.Ürün eklemek
export async function createProduct(req, res) {
	const { name, description, price, image, category, stock } = req.body

	try {
		const newProduct = new Product({
			name,
			description,
			price,
			image,
			category,
			stock,
		})
		await newProduct.save()
		res.status(201).json(newProduct)
	} catch (err) {
		console.error('PRODUCT CREATE ERROR', err)
		res.status(500).json({ error: err.message })
	}
}

//  4.Ürünü silmek
export async function deleteProduct(req, res) {
	try {
		const product = await Product.findByIdAndDelete(req.params.id)
		if (!product) return res.status(404).json({ msg: 'Mahsulot topilmadi' })
		res.json({ msg: 'Mahsulot o‘chirildi' })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

// 5.Ürünü güncellemek
export async function updateProduct(req, res) {
	const { name, description, price, image, category, stock } = req.body

	try {
		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			{
				name,
				description,
				price,
				image,
				category,
				stock,
			},
			{ new: true }
		)
		if (!updatedProduct)
			return res.status(404).json({ msg: 'Mahsulot topilmadi' })
		res.json(updatedProduct)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

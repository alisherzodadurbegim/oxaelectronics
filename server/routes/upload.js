import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import express from 'express'
import multer from 'multer'
dotenv.config()

const router = express.Router()

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
)
const upload = multer({ storage: multer.memoryStorage() }) // Fayl RAMda saqlanadi

router.post('/', upload.single('image'), async (req, res) => {
	try {
		const file = req.file
		if (!file) return res.status(400).json({ error: 'No file uploaded' })

		const fileName = `products/${Date.now()}-${file.originalname}`
		const { data, error } = await supabase.storage
			.from('image')
			.upload(fileName, file.buffer, {
				contentType: file.mimetype,
				upsert: true,
			})

		if (error) throw error

		const { data: publicUrl } = supabase.storage
			.from('image')
			.getPublicUrl(fileName)

		res.json({ success: true, imageUrl: publicUrl.publicUrl })
	} catch (err) {
		console.error('Upload error:', err.message)
		res.status(500).json({ error: 'Image upload failed' })
	}
})

export default router

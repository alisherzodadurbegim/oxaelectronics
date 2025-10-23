console.log('🟢 server/index.js started')

import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import next from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'

// routes import
import adminRoutes from './routes/adminRoute.js'
import authRoutes from './routes/authRoutes.js'
import cardRotes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import productRoutes from './routes/productRoutes.js'
import uploadRoute from './routes/upload.js'
dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev }) // frontend Next
const handle = app.getRequestHandler()

app
	.prepare()
	.then(() => {
		const server = express()

		// middlewares
		server.use(express.json())
		server.use(cors())
		server.use(cookieParser())
		server.use(
			'/_next/static',
			express.static(path.join(__dirname, '.next', 'static'))
		)
		server.use(
			'/uploads',
			express.static(path.join(process.cwd(), 'server/uploads'))
		)
		server.use('/public', express.static(path.join(__dirname, 'public')))
		// MongoDB connect
		connectDB()

		// API routes
		server.use('/api/auth', authRoutes)
		server.use('/api/products', productRoutes)
		server.use('/api/cart', cardRotes)
		server.use('/api/orders', orderRoutes)
		server.use('/api/upload', uploadRoute)

		server.use('/api/admin', adminRoutes)
		// All other routes Next.js ga topshiriladi
		server.use((req, res) => handle(req, res))

		const PORT = process.env.PORT || 3000
		server.listen(PORT, () =>
			console.log(
				`MongoDB başarıyla bağlandı, tebrikler! http://localhost:${PORT}`
			)
		)
	})
	.catch(err => console.error(err))

import mongoose from 'mongoose'

const connectDB = async () => {
	try {
		// Only connect if MongoDB URI is provided
		if (process.env.MONGO_URI) {
			const conn = await mongoose.connect(process.env.MONGO_URI)
			console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`)
		} else {
			console.log('MongoDB URI not provided. Skipping database connection.')
		}
	} catch (error) {
		console.error(`Error: ${error.message}`)
		process.exit(1)
	}
}

export default connectDB

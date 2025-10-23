import bcrypt from 'bcryptjs'
import express from 'express'
import jwt from 'jsonwebtoken'

import { protect } from '../middleware/authMiddleware.js'
import User from '../models/User.js'
const router = express.Router()
function createToken(user) {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
		expiresIn: '1d',
	})
}
router.get('/me', protect, (req, res) => {
	res.json({ success: true, user: req.user })
})
// Kayıt olma Register endpointi
router.post('/register', async (req, res) => {
	try {
		const { firstName, lastName, email, password, role } = req.body

		const existing = await User.findOne({ email })
		if (existing) {
			return res
				.status(400)
				.json({ success: false, message: 'User already exists' })
		}

		const hashed = await bcrypt.hash(password, 10)

		const newUser = await User.create({
			firstName,
			lastName,
			email,
			password: hashed,
			role: role || 'customer',
		})

		const token = createToken(newUser)

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000,
		})

		res.status(201).json({
			success: true,
			token,
			user: {
				id: newUser._id,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email,
				role: newUser.role,
			},
		})
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Giriş yapma (Login) endpointi
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email })
		if (!user) return res.status(400).json({ message: 'Invalid credentials' })

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch)
			return res.status(400).json({ message: 'Invalid credentials' })

		const token = createToken(user)
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000,
		})

		res.json({
			success: true,
			token,
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
			},
		})
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})
export default router

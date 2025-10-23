'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { OrderStore } from '@/lib/order-store'
import axios from 'axios'
import Cookies from 'js-cookie'
import type React from 'react'

import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	Eye,
	EyeOff,
	UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [agreeToTerms, setAgreeToTerms] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState<{ [key: string]: string }>({})
	const [showSuccessModal, setShowSuccessModal] = useState(false)
	const router = useRouter()

	const orderStore = OrderStore.getInstance()

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {}

		if (!formData.firstName.trim()) {
			newErrors.firstName = 'First name is required'
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Last name is required'
		}

		if (!formData.email) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address'
		}

		if (!formData.password) {
			newErrors.password = 'Password is required'
		} else if (formData.password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters long'
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password'
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match'
		}

		if (!agreeToTerms) {
			newErrors.terms = 'Please agree to the terms and conditions'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setIsLoading(true)

		try {
			const res = await axios.post('/api/auth/register', {
				firstName: formData.firstName.trim(),
				lastName: formData.lastName.trim(),
				email: formData.email,
				password: formData.password,
				role: 'customer',
			})

			const user = res.data.user

			if (res.data.success && user) {
				orderStore.logActivity({
					userId: user.id,
					userEmail: user.email,
					userName: user.name,
					action: 'register',
					details: `New customer account created: ${user.name}`,
				})
			}

			if (res.data.success && user) {
				localStorage.setItem('user', JSON.stringify(res.data.user))
				Cookies.set('token', res.data.token, { expires: 1 })

				Cookies.set('user', JSON.stringify(res.data.user), { expires: 1 })
				setShowSuccessModal(true)
				setTimeout(() => {
					router.push('/')
				}, 3000)
			}
		} catch (err: any) {
			setErrors({
				general: err.response?.data?.message || 'Something went wrong',
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-background flex items-center justify-center p-4'>
			<div className='w-full max-w-md'>
				{/* Header */}
				<div className='text-center mb-8'>
					<Link
						href='/'
						className='inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6'
					>
						<ArrowLeft className='h-4 w-4' />
						<span>Back to Store</span>
					</Link>
					<div className='flex items-center justify-center gap-2 mb-2'>
						<div className='h-10 w-10  flex items-center justify-center'>
							<img src='/logo.png' alt='logo' />
						</div>
						<span className='text-2xl font-bold'>OXA electronics</span>
					</div>
					<p className='text-muted-foreground'>Create your account</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<UserPlus className='h-5 w-5' />
							Create Account
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-4'>
							{errors.general && (
								<div className='flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
									<AlertCircle className='h-4 w-4' />
									<span>{errors.general}</span>
								</div>
							)}

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='firstName'>First Name</Label>
									<Input
										id='firstName'
										value={formData.firstName}
										onChange={e =>
											handleInputChange('firstName', e.target.value)
										}
										placeholder='John'
										className={
											errors.firstName
												? 'border-red-500 focus-visible:ring-red-500'
												: ''
										}
										required
									/>
									{errors.firstName && (
										<div className='flex items-center gap-1 mt-1 text-sm text-red-600'>
											<AlertCircle className='h-3 w-3' />
											<span>{errors.firstName}</span>
										</div>
									)}
								</div>
								<div>
									<Label htmlFor='lastName'>Last Name</Label>
									<Input
										id='lastName'
										value={formData.lastName}
										onChange={e =>
											handleInputChange('lastName', e.target.value)
										}
										placeholder='Doe'
										className={
											errors.lastName
												? 'border-red-500 focus-visible:ring-red-500'
												: ''
										}
										required
									/>
									{errors.lastName && (
										<div className='flex items-center gap-1 mt-1 text-sm text-red-600'>
											<AlertCircle className='h-3 w-3' />
											<span>{errors.lastName}</span>
										</div>
									)}
								</div>
							</div>

							<div>
								<Label htmlFor='email'>Email Address</Label>
								<Input
									id='email'
									type='email'
									value={formData.email}
									onChange={e => handleInputChange('email', e.target.value)}
									placeholder='your@email.com'
									className={
										errors.email
											? 'border-red-500 focus-visible:ring-red-500'
											: ''
									}
									required
								/>
								{errors.email && (
									<div className='flex items-center gap-1 mt-1 text-sm text-red-600'>
										<AlertCircle className='h-3 w-3' />
										<span>{errors.email}</span>
									</div>
								)}
							</div>

							<div>
								<Label htmlFor='password'>Password</Label>
								<div className='relative'>
									<Input
										id='password'
										type={showPassword ? 'text' : 'password'}
										value={formData.password}
										onChange={e =>
											handleInputChange('password', e.target.value)
										}
										placeholder='Create a password'
										className={
											errors.password
												? 'border-red-500 focus-visible:ring-red-500'
												: ''
										}
										required
									/>
									<Button
										type='button'
										variant='ghost'
										size='icon'
										className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className='h-4 w-4 text-muted-foreground' />
										) : (
											<Eye className='h-4 w-4 text-muted-foreground' />
										)}
									</Button>
								</div>
								{errors.password && (
									<div className='flex items-center gap-1 mt-1 text-sm text-red-600'>
										<AlertCircle className='h-3 w-3' />
										<span>{errors.password}</span>
									</div>
								)}
							</div>

							<div>
								<Label htmlFor='confirmPassword'>Confirm Password</Label>
								<div className='relative'>
									<Input
										id='confirmPassword'
										type={showConfirmPassword ? 'text' : 'password'}
										value={formData.confirmPassword}
										onChange={e =>
											handleInputChange('confirmPassword', e.target.value)
										}
										placeholder='Confirm your password'
										className={
											errors.confirmPassword
												? 'border-red-500 focus-visible:ring-red-500'
												: ''
										}
										required
									/>
									<Button
										type='button'
										variant='ghost'
										size='icon'
										className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff className='h-4 w-4 text-muted-foreground' />
										) : (
											<Eye className='h-4 w-4 text-muted-foreground' />
										)}
									</Button>
								</div>
								{errors.confirmPassword && (
									<div className='flex items-center gap-1 mt-1 text-sm text-red-600'>
										<AlertCircle className='h-3 w-3' />
										<span>{errors.confirmPassword}</span>
									</div>
								)}
							</div>

							<div className='flex items-start space-x-2'>
								<Checkbox
									id='terms'
									checked={agreeToTerms}
									onCheckedChange={checked =>
										setAgreeToTerms(checked as boolean)
									}
									className={errors.terms ? 'border-red-500' : ''}
								/>
								<div className='flex-1'>
									<Label htmlFor='terms' className='text-sm leading-relaxed'>
										I agree to the{' '}
										<Link
											href='/terms'
											className='text-primary hover:underline'
										>
											Terms of Service
										</Link>{' '}
										and{' '}
										<Link
											href='/privacy'
											className='text-primary hover:underline'
										>
											Privacy Policy
										</Link>
									</Label>
									{errors.terms && (
										<div className='flex items-center gap-1 mt-1 text-sm text-red-600'>
											<AlertCircle className='h-3 w-3' />
											<span>{errors.terms}</span>
										</div>
									)}
								</div>
							</div>

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? 'Creating Account...' : 'Create Account'}
							</Button>
						</form>

						<div className='mt-6'>
							<Separator className='my-4' />
							<div className='text-center'>
								<p className='text-sm text-muted-foreground'>
									Already have an account?{' '}
									<Link href='/login' className='text-primary hover:underline'>
										Sign in
									</Link>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{showSuccessModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
					<Card className='w-full max-w-md'>
						<CardContent className='p-6 text-center'>
							<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
								<CheckCircle className='w-8 h-8 text-green-600' />
							</div>
							<h3 className='text-lg font-semibold mb-2'>
								Account Created Successfully!
							</h3>
							<p className='text-muted-foreground mb-4'>
								Welcome to Oxa ELECTRONICS! You can now sign in with your new
								account.
							</p>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
}

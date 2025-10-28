'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import axios from 'axios'
import Cookies from 'js-cookie'
import type React from 'react'

import { AlertCircle, ArrowLeft, Eye, EyeOff, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState<{ [key: string]: string }>({})
	const router = useRouter()

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {}

		if (!formData.email) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address'
		}

		if (!formData.password) {
			newErrors.password = 'Password is required'
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
			const res = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
				formData,
				{ withCredentials: true }
			)
			const data = res.data

			Cookies.set('token', res.data.token, { expires: 1 })

			Cookies.set('user', JSON.stringify(res.data.user), { expires: 1 })

			if (data.user.role === 'admin') {
				router.push('/admin')
			} else {
				router.push('/')
			}
		} catch (err: any) {
			if (err.response) {
				setErrors({ general: err.response.data.message })
			} else {
				setErrors({ general: 'Server error' })
			}
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
					<p className='text-muted-foreground'>Sign in to your account</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							Sign In
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
										placeholder='Enter your password'
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

							<div className='flex items-center justify-between'>
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='remember'
										checked={rememberMe}
										onCheckedChange={checked =>
											setRememberMe(checked as boolean)
										}
									/>
									<Label htmlFor='remember' className='text-sm'>
										Remember me
									</Label>
								</div>
								<Link
									href='/forgot-password'
									className='text-sm text-primary hover:underline'
								>
									Forgot password?
								</Link>
							</div>

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? 'Signing in...' : 'Sign In'}
							</Button>
						</form>

						<div className='mt-6'>
							<Separator className='my-4' />
							<div className='text-center'>
								<p className='text-sm text-muted-foreground'>
									Don't have an account?{' '}
									<Link
										href='/register'
										className='text-primary hover:underline'
									>
										Create one
									</Link>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className='text-center mt-6'>
					<p className='text-xs text-muted-foreground'>
						By signing in, you agree to our{' '}
						<Link href='/terms' className='hover:underline'>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link href='/privacy' className='hover:underline'>
							Privacy Policy
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}

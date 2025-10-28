'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import axios from 'axios'
import { ArrowLeft, Truck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
const formatPrice = (price: number) => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency: 'UZS',
		currencyDisplay: 'code', // har doim "UZS" bo‘ladi, "so‘m" emas
		minimumFractionDigits: 0,
	}).format(price)
}
export default function CheckoutPage() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		email: '',
		firstName: '',
		lastName: '',
		address: '',
		city: '',
		postalCode: '',
		country: 'United States',
		phone: '',
		cardNumber: '',
		expiryDate: '',
		cvv: '',
		cardName: '',
	})
	const [paymentMethod, setPaymentMethod] = useState('card')
	const [createAccount, setCreateAccount] = useState(false)

	// Mock order data
	type OrderItem = {
		productId: string
		name: string
		price: number
		quantity: number
	}
	const [orderItems, setOrderItems] = useState<OrderItem[]>([])
	const [subtotal, setSubtotal] = useState(0)
	const [shipping, setShipping] = useState(0)
	const [tax, setTax] = useState(0)
	const [total, setTotal] = useState(0)

	useEffect(() => {
		const sub = orderItems.reduce(
			(acc, item) => acc + item.price * item.quantity,
			0
		)
		const sh = 0 // Shippingni hozir Free deb belgilaymiz
		const t = sub * 0.08 // tax 8% misol uchun
		setSubtotal(sub)
		setShipping(sh)
		setTax(t)
		setTotal(sub + sh + t)
	}, [orderItems])

	useEffect(() => {
		async function fetchCartItems() {
			const cart = JSON.parse(localStorage.getItem('cart') || '[]')

			const items = await Promise.all(
				cart.map(async (item: { productId: string; quantity: number }) => {
					const res = await axios.get(
						`${process.env.NEXT_PUBLIC_API_URL}/api/products/${item.productId}`
					)
					return {
						productId: res.data._id,
						name: res.data.name,
						price: res.data.price,
						quantity: item.quantity,
					}
				})
			)

			setOrderItems(items)
		}

		fetchCartItems()
	}, [])
	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const orderData = {
			customer: { ...formData },
			items: orderItems,
			subtotal,
			shipping,

			total,
			paymentMethod,
		}

		try {
			const res = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
				orderData,
				{ withCredentials: true }
			)
			console.log('Order created:', res.data)
			localStorage.setItem('pendingOrder', JSON.stringify(res.data))
			router.push('/payment')
		} catch (err) {
			console.error(err)
			alert('Order yaratishda xatolik yuz berdi')
		}
	}

	return (
		<div className='min-h-screen bg-background'>
			<header className='border-b'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<Link
							href='/cart'
							className='flex items-center gap-2 hover:text-primary'
						>
							<ArrowLeft className='h-5 w-5' />
							<span>Back to Cart</span>
						</Link>
						<h1 className='text-xl font-semibold'>Checkout</h1>
						<div className='w-32' />
					</div>
				</div>
			</header>

			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<form onSubmit={handleSubmit}>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						{/* Checkout Form */}
						<div className='space-y-6'>
							{/* Contact Information */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<span>Contact Information</span>
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<Label htmlFor='email'>Email Address</Label>
										<Input
											id='email'
											type='email'
											value={formData.email}
											onChange={e => handleInputChange('email', e.target.value)}
											placeholder='your@email.com'
											required
										/>
									</div>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='create-account'
											checked={createAccount}
											onCheckedChange={checked =>
												setCreateAccount(checked as boolean)
											}
										/>
										<Label htmlFor='create-account' className='text-sm'>
											Create an account for faster checkout next time
										</Label>
									</div>
								</CardContent>
							</Card>

							{/* Shipping Address */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Truck className='h-5 w-5' />
										<span>Shipping Address</span>
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<Label htmlFor='firstName'>First Name</Label>
											<Input
												id='firstName'
												value={formData.firstName}
												onChange={e =>
													handleInputChange('firstName', e.target.value)
												}
												required
											/>
										</div>
										<div>
											<Label htmlFor='lastName'>Last Name</Label>
											<Input
												id='lastName'
												value={formData.lastName}
												onChange={e =>
													handleInputChange('lastName', e.target.value)
												}
												required
											/>
										</div>
									</div>
									<div>
										<Label htmlFor='address'>Address</Label>
										<Input
											id='address'
											value={formData.address}
											onChange={e =>
												handleInputChange('address', e.target.value)
											}
											placeholder='123 Main Street'
											required
										/>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<Label htmlFor='city'>City</Label>
											<Input
												id='city'
												value={formData.city}
												onChange={e =>
													handleInputChange('city', e.target.value)
												}
												required
											/>
										</div>
										<div>
											<Label htmlFor='postalCode'>Postal Code</Label>
											<Input
												id='postalCode'
												value={formData.postalCode}
												onChange={e =>
													handleInputChange('postalCode', e.target.value)
												}
												required
											/>
										</div>
									</div>
									<div>
										<Label htmlFor='phone'>Phone Number</Label>
										<Input
											id='phone'
											type='tel'
											value={formData.phone}
											onChange={e => handleInputChange('phone', e.target.value)}
											placeholder='+1 (555) 123-4567'
											required
										/>
									</div>
								</CardContent>
							</Card>

							{/* Payment Method */}
						</div>

						{/* Order Summary */}
						<div>
							<Card className='sticky top-4'>
								<CardHeader>
									<CardTitle>Order Summary</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='space-y-3'>
										{orderItems.map(item => (
											<div
												key={item.productId}
												className='flex justify-between items-center'
											>
												<div>
													<p className='font-medium'>{item.name}</p>
													<p className='text-sm text-muted-foreground'>
														Qty: {item.quantity}
													</p>
												</div>
												<p className='font-medium'>
													{formatPrice(item.price * item.quantity)}
												</p>
											</div>
										))}
									</div>

									<Separator />

									<div className='space-y-2'>
										<div className='flex justify-between'>
											<span>Subtotal</span>
											<span>{formatPrice(subtotal)}</span>
										</div>
										<div className='flex justify-between'>
											<span>Shipping</span>
											<span>
												{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
											</span>
										</div>

										<Separator />
										<div className='flex justify-between font-semibold text-lg'>
											<span>Total</span>
											<span>{formatPrice(total)}</span>
										</div>
									</div>

									<Button type='submit' className='w-full' size='lg'>
										Place Order
									</Button>

									<p className='text-xs text-muted-foreground text-center'>
										By completing your order, you agree to our Terms of Service
										and Privacy Policy.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}

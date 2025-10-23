'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { OrderStore } from '@/lib/order-store'
import { ArrowLeft, CreditCard, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const formatPrice = (price: number) => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency: 'UZS',
		currencyDisplay: 'code', // har doim "UZS" bo‘ladi, "so‘m" emas
		minimumFractionDigits: 0,
	}).format(price)
}

export default function PaymentPage() {
	const [showSuccessModal, setShowSuccessModal] = useState(false)
	const [orderData, setOrderData] = useState<any>(null)

	const orderStore = OrderStore.getInstance()

	useEffect(() => {
		const stored = localStorage.getItem('pendingOrder')
		if (stored) {
			setOrderData(JSON.parse(stored))
		}
	}, [])

	const handlePaymentCompleted = () => {
		if (!orderData) return

		// Backend/store ga statusni update qilish
		// orderStore.updateOrder(orderData.id, {
		// 	status: 'confirmed',
		// 	paymentStatus: 'paid',
		// })

		// Success modalni ko‘rsatish
		setShowSuccessModal(true)

		// LocalStorage dan o‘chirish
		localStorage.removeItem('pendingOrder')
	}

	const handleModalClose = () => {
		setShowSuccessModal(false)
		window.location.href = '/'
	}

	// Fallback agar localStorage bo‘sh bo‘lsa
	const defaultOrder = {
		items: [
			{ name: 'Premium Wireless Headphones', price: 299.99, quantity: 1 },
			{ name: 'Organic Cotton T-Shirt', price: 29.99, quantity: 2 },
		],
		subtotal: 359.97,
		shipping: 0,
		tax: 28.8,
		total: 388.77,
	}

	const order = orderData || defaultOrder

	return (
		<div className='min-h-screen bg-background'>
			<header className='border-b'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<Link
							href='/checkout'
							className='flex items-center gap-2 hover:text-primary'
						>
							<ArrowLeft className='h-5 w-5' />
							<span>Back to Checkout</span>
						</Link>
						<h1 className='text-xl font-semibold'>Payment</h1>
						<div className='w-32' />
					</div>
				</div>
			</header>

			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='max-w-2xl mx-auto space-y-6'>
					{/* Payment Method */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<CreditCard className='h-5 w-5' />
								Bank Card Transfer
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white'>
								<div className='space-y-2'>
									<p className='text-sm opacity-90'>Card Number</p>
									<p className='text-2xl font-mono tracking-wider'>
										9860 0824 3654 5246
									</p>
								</div>
							</div>

							<div className='space-y-3'>
								<div className='flex justify-between items-center p-3 bg-muted rounded-lg'>
									<span className='font-medium'>Total Amount</span>
									<span className='text-xl font-bold text-primary'>
										{formatPrice(order.total)}
									</span>
								</div>

								<div className='p-4 border border-orange-200 bg-orange-50 rounded-lg'>
									<p className='text-sm text-orange-800 mb-2'>
										<strong>Payment Instructions:</strong>
									</p>
									<p className='text-sm text-orange-700'>
										Please make the payment to the above card number and contact
										us via Telegram for confirmation.
									</p>
								</div>

								<div className='flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
									<MessageCircle className='h-5 w-5 text-blue-600' />
									<div>
										<p className='text-sm font-medium text-blue-800'>
											Contact for Issues
										</p>
										<p className='text-sm text-blue-600'>
											Telegram:{' '}
											<Link
												className='underline hover:text-primary dark:hover:text-primary-foreground transition-colors duration-300 ease-in-out underline-offset-4 hover:underline-offset-0 dark:hover:underline-offset-4 hover:decoration-primary dark:hover:decoration-primary-foreground dark:hover:decoration-offset-4 dark:hover:decoration-200'
												href='https://t.me/oxauz'
											>
												Oxa{' '}
											</Link>
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Order Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-3'>
								{order.items.map((item: any, index: number) => (
									<div
										key={index}
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
									<span>{formatPrice(order.subtotal)}</span>
								</div>
								<div className='flex justify-between'>
									<span>Shipping</span>
									<span>
										{order.shipping === 0
											? 'Free'
											: `$${order.shipping?.toFixed(2)}`}
									</span>
								</div>
								{order.tax && (
									<div className='flex justify-between'>
										<span>Tax</span>
										<span>${order.tax.toFixed(2)}</span>
									</div>
								)}
								<Separator />
								<div className='flex justify-between font-semibold text-xl'>
									<span>Total Amount</span>
									<span className='text-primary'>
										{formatPrice(order.total)}
									</span>
								</div>
							</div>

							<Button
								onClick={handlePaymentCompleted}
								className='w-full'
								size='lg'
							>
								Payment Completed
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Success Modal */}
			<Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
				<DialogContent className='max-w-md'>
					<div className='flex flex-col items-center text-center p-6'>
						<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
							<svg
								className='w-8 h-8 text-green-600'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M5 13l4 4L19 7'
								/>
							</svg>
						</div>
						<h3 className='text-lg font-semibold text-foreground mb-2'>
							Purchase Successful!
						</h3>
						<p className='text-muted-foreground mb-6'>
							Your purchase was successful! Our admin will contact you. Delivery
							will be made within 15 days.
						</p>
						<Button onClick={handleModalClose} className='w-full'>
							Continue Shopping
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import axios from 'axios'
import Cookies from 'js-cookie'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type User = {
	id: string
	firstName?: string
	email?: string
}

type CartItem = {
	id: string
	productId?: string
	name: string
	price: number
	quantity: number
	image?: string
}
const formatPrice = (price: number) => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency: 'UZS',
		currencyDisplay: 'code', // har doim "UZS" bo‘ladi, "so‘m" emas
		minimumFractionDigits: 0,
	}).format(price)
}
function normalizeServerItem(raw: any): CartItem {
	const product =
		raw.productId && typeof raw.productId === 'object'
			? raw.productId
			: raw.product || {}

	const id = String(
		product._id ||
			product.id ||
			raw.productId ||
			raw._id ||
			raw.id ||
			Math.random().toString(36).substring(2, 9) // fallback
	)

	const name = product?.name || raw?.name || 'Unnamed'
	const price = Number(product?.price ?? raw?.price ?? 0)
	const image = product?.image || raw?.image || ''
	const quantity = Number(raw?.quantity ?? 1)

	return {
		id,
		productId: String(product._id ?? product.id ?? id),
		name,
		price,
		quantity,
		image,
	}
}

export default function CartPage() {
	const [cartItems, setCartItems] = useState<CartItem[]>([])
	const [user, setUser] = useState<User | null>(null)
	const [promoCode, setPromoCode] = useState<string>('')
	const [subtotal, setSubtotal] = useState<number>(0)
	const [shipping, setShipping] = useState<number>(0)
	const [tax, setTax] = useState<number>(0)
	const [total, setTotal] = useState<number>(0)

	const router = useRouter()

	useEffect(() => {
		const storedUser = JSON.parse(Cookies.get('user') || 'null') as User | null
		setUser(storedUser)
		if (storedUser && storedUser.id) {
			fetchCart(storedUser.id)
		} else {
			const localCart = JSON.parse(
				localStorage.getItem('cart') || '[]'
			) as any[]

			const normalized = localCart.map(item => {
				return {
					id: String(
						item.id ?? item._id ?? item.productId ?? item.product?._id
					),
					productId: String(item.productId ?? item._id ?? item.id),
					name: item.name ?? item.product?.name ?? 'No name',
					price: Number(item.price ?? item.product?.price ?? 0),
					quantity: Number(item.quantity ?? 1),
					image: item.image ?? item.product?.image ?? '',
				} as CartItem
			})
			setCartItems(normalized)
		}
	}, [])

	const fetchCart = async (userId: string) => {
		try {
			const { data } = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
				{
					params: { userId },
				}
			)
			const items = data?.items ?? []
			const normalized: CartItem[] = items.map(normalizeServerItem)
			setCartItems(normalized)
		} catch (err) {
			console.error('Cart fetch error', err)
		}
	}

	const updateQuantity = async (productId: string, newQty: number) => {
		if (newQty < 1) return removeItem(productId)

		const updatedLocal = cartItems.map(item =>
			item.productId === productId ? { ...item, quantity: newQty } : item
		)
		setCartItems(updatedLocal)
		localStorage.setItem('cart', JSON.stringify(updatedLocal))

		if (user && user.id) {
			try {
				await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
					userId: user.id,
					productId,
					quantity: newQty,
				})
				await fetchCart(user.id)
			} catch (err) {
				console.error('Sync updateQuantity failed', err)
			}
		}
	}

	const removeItem = async (productId: string) => {
		const updatedLocal = cartItems.filter(item => item.productId !== productId)
		setCartItems(updatedLocal)
		localStorage.setItem('cart', JSON.stringify(updatedLocal))

		if (user && user.id) {
			try {
				await axios.delete(
					`${process.env.NEXT_PUBLIC_API_URL}/api/cart/remove/${productId}`,
					{
						data: { userId: user.id },
					}
				)
				await fetchCart(user.id)
			} catch (err) {
				console.error('Remove item failed', err)
			}
		}
	}
	useEffect(() => {
		const sub = cartItems.reduce(
			(acc, item) => acc + item.price * item.quantity,
			0
		)
		setSubtotal(sub)
		const ship = sub > 100 ? 0 : 10
		setShipping(ship)

		setTotal(sub + ship)
	}, [cartItems])

	const handleCheckout = () => {
		if (!user) {
			router.push('/login')
		} else {
			router.push('/checkout')
		}
	}

	if (cartItems.length === 0) {
		return (
			<div className='min-h-screen bg-background'>
				<header className='border-b'>
					<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
						<div className='flex h-16 items-center'>
							<Link href='/' className='flex items-center gap-2'>
								<ArrowLeft className='h-5 w-5' />
								<span>Continue Shopping</span>
							</Link>
						</div>
					</div>
				</header>

				<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-16'>
					<div className='text-center max-w-md mx-auto'>
						<ShoppingBag className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
						<h1 className='text-2xl font-semibold mb-2'>Your cart is empty</h1>
						<p className='text-muted-foreground mb-6'>
							Looks like you haven't added any items to your cart yet.
						</p>
						<Link href='/'>
							<Button size='lg'>Start Shopping</Button>
						</Link>
					</div>
				</div>
			</div>
		)
	}

	// ----- main render -----
	return (
		<div className='min-h-screen bg-background'>
			<header className='border-b'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<Link
							href='/'
							className='flex items-center gap-2 hover:text-primary'
						>
							<ArrowLeft className='h-5 w-5' />
							<span>Continue Shopping</span>
						</Link>
						<h1 className='text-xl font-semibold'>Shopping Cart</h1>
						<div className='w-32' />
					</div>
				</div>
			</header>

			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					<div className='lg:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center justify-between'>
									Cart Items
									<Badge variant='secondary'>{cartItems.length} items</Badge>
								</CardTitle>
							</CardHeader>

							<CardContent className='space-y-4'>
								{cartItems.map((item, idx) => (
									<div key={item.id || item.productId || idx}>
										<div className='flex items-center gap-4'>
											<img
												src={item.image || '/placeholder.svg'}
												alt={item.name}
												className='w-20 h-20 object-cover rounded-lg'
											/>
											<div className='flex-1'>
												<h3 className='font-medium'>{item.name}</h3>
												<p className='text-lg font-semibold text-primary'>
													{formatPrice(item.price)}
												</p>
											</div>
											<div className='flex items-center gap-2'>
												<Button
													variant='outline'
													size='icon'
													className='h-8 w-8 bg-transparent'
													onClick={() =>
														updateQuantity(
															item.productId ?? item.id,
															item.quantity - 1
														)
													}
												>
													<Minus className='h-4 w-4' />
												</Button>
												<span className='w-8 text-center'>{item.quantity}</span>
												<Button
													variant='outline'
													size='icon'
													className='h-8 w-8 bg-transparent'
													onClick={() =>
														updateQuantity(
															item.productId ?? item.id,
															item.quantity + 1
														)
													}
												>
													<Plus className='h-4 w-4' />
												</Button>
											</div>
											<Button
												variant='ghost'
												size='icon'
												className='text-destructive hover:text-destructive'
												onClick={() => removeItem(item.productId ?? item.id)}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
										{idx < cartItems.length - 1 && (
											<Separator className='mt-4' />
										)}
									</div>
								))}
							</CardContent>
						</Card>
					</div>

					<div>
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
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
										<span>{formatPrice(subtotal + shipping)}</span>
									</div>
								</div>

								<div className='space-y-2'>
									<Input
										placeholder='Promo code'
										value={promoCode}
										onChange={e => setPromoCode(e.target.value)}
									/>
									<Button variant='outline' className='w-full bg-transparent'>
										Apply Code
									</Button>
								</div>

								<Button className='w-full' size='lg' onClick={handleCheckout}>
									Proceed to Checkout
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

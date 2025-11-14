'use client'

import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	CheckCircle,
	Clock,
	CreditCard,
	Heart,
	Shield,
	ShoppingCart,
	Star,
	Truck,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SocialIcon } from 'react-social-icons'

export default function ProductDetailPage({
	params,
}: {
	params: { id: string }
}) {
	const { id } = params
	const LoaderIcon = () => (
		<svg
			className='h-4 w-4 animate-spin'
			fill='none'
			stroke='currentColor'
			viewBox='0 0 24 24'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
			/>
		</svg>
	)
	const [product, setProduct] = useState<any>(null)
	const [activeImage, setActiveImage] = useState<string>('')

	const [wishlist, setWishlist] = useState<string[]>([])
	const [showNotification, setShowNotification] = useState(false)

	// ============================
	// FETCH PRODUCT
	// ============================
	useEffect(() => {
		async function fetchProduct() {
			try {
				const res = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`
				)
				setProduct(res.data)
				setActiveImage(res.data.image)
			} catch (error) {
				console.error('Product load error:', error)
			}
		}

		fetchProduct()
	}, [id])

	// ============================
	// LOAD WISHLIST
	// ============================
	useEffect(() => {
		const list = JSON.parse(localStorage.getItem('wishlist') || '[]')
		setWishlist(list)
	}, [])

	// ============================
	// WISHLIST TOGGLE
	// ============================
	const toggleWishlist = (productId: string) => {
		let updated: string[] = []

		if (wishlist.includes(productId)) {
			updated = wishlist.filter(id => id !== productId)
		} else {
			updated = [...wishlist, productId]
		}

		setWishlist(updated)
		localStorage.setItem('wishlist', JSON.stringify(updated))
	}

	// ============================
	// ADD TO CART (WORKING NOTIFICATION)
	// ============================
	const addToCart = async (
		productId: string,
		name: string,
		price: number,
		image: string
	) => {
		const cookieUser = Cookies.get('user')
		const storedUser = cookieUser ? JSON.parse(cookieUser) : null

		// USER LOGGED IN
		if (storedUser && storedUser.id) {
			try {
				await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
					userId: storedUser.id,
					productId,
					quantity: 1,
				})

				// SHOW NOTIFICATION
				setShowNotification(true)
				setTimeout(() => setShowNotification(false), 5000)
			} catch (err) {
				console.error('Cart server error:', err)
			}

			return
		}

		// USER NOT LOGGED IN → LOCAL STORAGE
		const localCart = JSON.parse(localStorage.getItem('cart') || '[]')

		const existing = localCart.find((item: any) => item.productId === productId)

		if (existing) {
			existing.quantity += 1
		} else {
			localCart.push({
				productId,
				name,
				price,
				image,
				quantity: 1,
			})
		}

		localStorage.setItem('cart', JSON.stringify(localCart))

		// SHOW NOTIFICATION
		setShowNotification(true)
		setTimeout(() => setShowNotification(false), 4000)
	}

	if (!product) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Card>
					<CardContent className='p-6 flex items-center gap-2'>
						<LoaderIcon />
						<span>Please wait...</span>
					</CardContent>
				</Card>
			</div>
		)
	}
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('uz-UZ', {
			style: 'currency',
			currency: 'UZS',
			currencyDisplay: 'code', // har doim "UZS" bo‘ladi, "so‘m" emas
			minimumFractionDigits: 0,
		}).format(price)
	}
	const isWishlisted = wishlist.includes(product._id)

	return (
		<div>
			{showNotification && (
				<div className='fixed top-10 right-10 z-50'>
					<div
						className='
      relative
      w-auto 
      px-6 py-4
      text-white
      font-semibold
      rounded-2xl
      shadow-[0_10px_30px_rgba(0,0,0,0.45)]
      backdrop-blur-xl
      bg-green-600/30
      border border-white/20
      flex items-center
      overflow-hidden
      animate-[slideIn_0.45s_ease-out,fadeOut_0.6s_ease-in_3.2s_forwards]
			animate-bounce
    '
					>
						{/* subtle gray overlay for depth */}
						<div
							className='
        absolute inset-0
        bg-gradient-to-br from-green-800/20 to-gray-900/30
        rounded-2xl
        pointer-events-none
      '
						></div>

						{/* Notification text */}
						<span className='relative z-10 text-lg'>
							✔ Product added to cart!
						</span>
					</div>
				</div>
			)}

			<div className='max-w-7xl mx-auto p-6'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
					{/* LEFT IMAGES */}
					<div>
						<div className='rounded-xl overflow-hidden border shadow'>
							<img
								src={activeImage}
								alt={product.name}
								className='w-full h-96 object-contain'
							/>
						</div>

						<div className='flex gap-3 mt-3 overflow-x-auto'>
							{[product.image, ...(product.images || [])].map((img, i) => (
								<img
									key={i}
									src={img}
									onClick={() => setActiveImage(img)}
									className={`h-16 w-16 rounded-lg cursor-pointer border object-contain ${
										activeImage === img ? 'border-blue-600' : 'border-gray-300'
									}`}
								/>
							))}
						</div>
					</div>

					{/* RIGHT DETAILS */}
					<div className='flex flex-col justify-center mt-10'>
						<h1 className='text-2xl font-bold'>{product.name}</h1>
						<p className='text-2xl font-bold'>{product.description}</p>

						<p className='text-3xl font-bold text-black-500 mt-4'>
							{formatPrice(product.price)}
						</p>

						<div className='flex gap-3 mt-6'>
							<button
								onClick={() =>
									addToCart(
										product._id,
										product.name,
										product.price,
										product.image
									)
								}
								className='
    relative
    px-5 py-3
    rounded-xl
    flex items-center gap-2
    text-white font-semibold
    overflow-hidden
    
    /* PREMIUM SILVER-GUNMETAL GRADIENT */
    bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900
    
    shadow-[0_0_25px_rgba(0,0,0,0.6)]
    animate-silverPulse

    transition-all duration-500
    hover:scale-105 hover:shadow-[0_0_35px_rgba(200,200,200,0.4)]

    before:absolute before:inset-0
    before:bg-gradient-to-r before:from-white/10 before:via-transparent before:to-white/10
    before:opacity-40
    before:animate-lightSweep
    before:rounded-xl
    before:pointer-events-none
  '
							>
								<ShoppingCart size={18} />
								Add to Cart
							</button>

							<style jsx>{`
								@keyframes silverPulse {
									0%,
									100% {
										background-position: 0% 50%;
										filter: brightness(1);
									}
									50% {
										background-position: 100% 50%;
										filter: brightness(1.25); /* daha çok parlayadi */
									}
								}

								.animate-silverPulse {
									background-size: 200% 200%;
									animation: silverPulse 3s ease-in-out infinite;
								}

								/* Yorugʻlik chizigʻi oqib o‘tadi */
								@keyframes lightSweep {
									0% {
										opacity: 0.1;
										transform: translateX(-150%);
									}
									50% {
										opacity: 0.4;
										transform: translateX(0%);
									}
									100% {
										opacity: 0.1;
										transform: translateX(150%);
									}
								}
							`}</style>

							<button
								onClick={() => toggleWishlist(product._id)}
								className='border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100'
							>
								<Heart
									size={18}
									className={isWishlisted ? 'fill-red-500 text-red-500' : ''}
								/>
								{isWishlisted ? 'Wishlisted' : 'Wishlist'}
							</button>
						</div>

						<p className='mt-5'>
							<b>Category:</b> {product.category}
						</p>

						{/* SOCIAL ICONS */}
						<div className='flex gap-3 mt-5'>
							<SocialIcon
								url='https://facebook.com/oxaelectronics'
								style={{ height: 30, width: 30 }}
							/>
							<SocialIcon
								url='https://instagram.com/oxaelectronics'
								style={{ height: 30, width: 30 }}
							/>
							<SocialIcon
								url='https://t.me/oxaelectronics'
								style={{ height: 30, width: 30 }}
							/>
						</div>
					</div>
				</div>

				{/* SPECS */}
				<div className='mt-10 bg-white shadow p-5 rounded-xl'>
					<h2 className='text-xl font-bold mb-3 flex items-center gap-2'>
						<Shield size={30} className='text-black-600' />
						Specifications
					</h2>
					<p className='text-gray-900 whitespace-pre-line flex flex-col gap-1'>
						<span className='flex items-center gap-2'>
							<CheckCircle size={20} className='text-green-500' /> High quality
						</span>
						<span className='flex items-center gap-2'>
							<Star size={20} className='text-yellow-500' /> Everything is
							reliable
						</span>
						<span className='flex items-center gap-2'>
							Contact:{' '}
							<Link
								href='https://t.me/oxauz'
								className='text-blue-600 underline hover:text-blue-800 '
							>
								OXA Electronics
							</Link>
						</span>
					</p>
				</div>

				{/* DELIVERY */}
				<div className='mt-5 bg-white shadow p-5 rounded-xl'>
					<h2 className=' font-bold mb-2 text-xl flex items-center gap-2'>
						<Truck size={30} className='text-black-600' />
						Delivery Information
					</h2>
					<p className='text-gray-900 flex  flex-col gap-1'>
						<span className='flex items-center gap-2'>
							<Clock size={20} /> Delivery: in 5–15 days
						</span>
						<span className='flex items-center gap-2'>
							<Truck size={20} /> Tracking available
						</span>
						<span className='flex items-center gap-2'>
							<CreditCard size={20} /> Cash or card on delivery
						</span>
					</p>
				</div>
			</div>
		</div>
	)
}

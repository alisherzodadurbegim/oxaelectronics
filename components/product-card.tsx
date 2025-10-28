'use client'

import type React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useRef, useState } from 'react'

interface ProductCardProps {
	product: {
		id: number
		name: string
		description: string
		price: number
		category: string
		image_url: string
		stock: number
		featured: string
		rating: number
	}
	isWishlisted: boolean
	onWishlistToggle: () => void
	onAddToCart: () => void
	onProductClick: (product: any) => void
	formatPrice: (price: number) => string
}

export function ProductCard({
	product,

	onWishlistToggle,
	onAddToCart,
	onProductClick,
	formatPrice,
}: ProductCardProps) {
	const [imageError, setImageError] = useState(false)
	const [isWishlisted, setIsWishlisted] = useState(false)
	const imageRef = useRef<HTMLImageElement>(null)

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation()
		onAddToCart()

		// 🔥 Fly-to-cart animatsiya
		const cartIcon = document.querySelector('#cart-icon') as HTMLElement
		if (imageRef.current && cartIcon) {
			const productRect = imageRef.current.getBoundingClientRect()
			const cartRect = cartIcon.getBoundingClientRect()

			const flyImg = document.createElement('img')
			flyImg.src = imageRef.current.src
			flyImg.className =
				'w-16 h-16 rounded-full object-cover fixed z-[9999] pointer-events-none shadow-lg'
			flyImg.style.left = productRect.left + 'px'
			flyImg.style.top = productRect.top + 'px'
			flyImg.style.transition =
				'transform 1s cubic-bezier(0.9, -0.3, 0.6, 1.5), opacity 3s'
			flyImg.style.transform = 'scale(1)'
			document.body.appendChild(flyImg)

			// start point
			const startX = productRect.left
			const startY = productRect.top
			const endX = cartRect.left - productRect.left
			const endY = cartRect.top - productRect.top

			// animatsiya boshlash
			requestAnimationFrame(() => {
				flyImg.style.transform = `translate(${endX}px, ${endY}px) scale(0.2) rotate(720deg)`
				flyImg.style.opacity = '0'
			})

			// tugagach olib tashlash
			flyImg.addEventListener('transitionend', () => {
				flyImg.remove()
				// ✅ optional: cart iconni biroz titratib highlight qilish
				cartIcon.classList.add('scale-110')
				setTimeout(() => cartIcon.classList.remove('scale-110'), 200)
			})
		}
	}

	const renderRating = () => {
		const rating = product.rating || 4.5
		const fullStars = Math.floor(rating)
		const hasHalfStar = rating % 1 !== 0

		return (
			<div className='flex items-center space-x-1'>
				{[...Array(5)].map((_, i) => (
					<Star
						key={i}
						className={`h-3 w-3 ${
							i < fullStars
								? 'fill-yellow-400 text-yellow-400'
								: i === fullStars && hasHalfStar
								? 'fill-yellow-400/50 text-yellow-400'
								: 'text-gray-300'
						}`}
					/>
				))}
				<span className='text-xs text-muted-foreground ml-1'>
					({product.rating})
				</span>
			</div>
		)
	}

	const imageUrl = imageError ? '/placeholder.svg' : product.image_url

	return (
		<Card
			className='group cursor-pointer transition-all p-0 duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden'
			onClick={() => onProductClick(product)}
		>
			<CardContent className='p-0'>
				{/* Image Container */}
				<div className='relative aspect-[4/3] overflow-hidden bg-muted'>
					<img
						ref={imageRef}
						src={imageUrl || '/placeholder.svg'}
						alt={product.name}
						className='w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 my-0'
						onError={() => setImageError(true)}
					/>

					{/* Badges */}
					<div className='absolute top-2 left-2 flex flex-col space-y-1'>
						{product.featured === 'true' && (
							<Badge variant='destructive' className='text-xs'>
								Featured
							</Badge>
						)}
						{product.stock < 10 && product.stock > 0 && (
							<Badge
								variant='outline'
								className='text-xs bg-orange-100 text-orange-800 border-orange-200'
							>
								Low Stock
							</Badge>
						)}
						{product.stock === 0 && (
							<Badge variant='secondary' className='text-xs'>
								Out of Stock
							</Badge>
						)}
					</div>

					{/* Wishlist Button */}
					<Button
						variant='ghost'
						size='sm'
						className='absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background'
						onClick={e => {
							e.stopPropagation()
							setIsWishlisted(prev => !prev)
							onWishlistToggle()
						}}
					>
						<Heart
							className={`h-4 w-4 transition ${
								isWishlisted
									? 'fill-red-500 text-red-500'
									: 'text-muted-foreground'
							}`}
						/>
					</Button>
				</div>

				{/* Product Info */}
				<div className='p-4 space-y-2 relative'>
					<div className='flex items-start justify-between'>
						<h3 className='font-semibold text-sm line-clamp-2 flex-1'>
							{product.name}
						</h3>
					</div>

					<p className='text-xs text-muted-foreground line-clamp-2'>
						{product.description}
					</p>

					{renderRating()}

					<div className='flex items-center justify-between pt-1'>
						<div className='flex flex-col'>
							<span className='text-lg font-bold text-primary'>
								{formatPrice(product.price)}
							</span>
							<span className='text-xs text-muted-foreground'>
								{product.category}
							</span>
						</div>

						<div className='text-xs text-muted-foreground text-right'>
							{product.stock > 0 ? (
								<span>{product.stock} in stock</span>
							) : (
								<span className='text-destructive'>Out of stock</span>
							)}
						</div>
					</div>
					<div className='absolute bottom-2 left-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200'>
						<Button
							onClick={handleAddToCart}
							disabled={product.stock === 0}
							size='sm'
							className={`w-full relative overflow-hidden rounded-xl
        backdrop-blur-xl 
        bg-white/10 
        border 
        text-black font-semibold
        shadow-[0_0_10px_rgba(255,255,255,0.1)]
        hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]
        hover:bg-white/20
        transition-all duration-500 ease-out
        before:absolute before:inset-0 
        before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
        before:translate-x-[-200%] hover:before:translate-x-[200%]
        before:transition-transform before:duration-700
        ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
						>
							<ShoppingCart className='h-4 w-4 mr-2' />
							{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

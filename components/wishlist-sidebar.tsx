// WishlistSidebar.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Product = {
	_id: string
	name: string
	price: number
	image?: string
}

type Props = {
	open: boolean
	setOpen: (open: boolean) => void
	wishlist: string[]
	setWishlist: React.Dispatch<React.SetStateAction<string[]>>
	products: Product[]
	onAddToCart: (product: Product) => void
}

export default function WishlistSidebar({
	open,
	setOpen,
	wishlist,
	setWishlist,
	products,
	onAddToCart,
}: Props) {
	const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])

	useEffect(() => {
		const filtered = products.filter(p => wishlist.includes(p._id))
		setWishlistProducts(filtered)
	}, [wishlist, products])

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [open])

	const removeFromWishlist = (id: string) => {
		const updated = wishlist.filter(pId => pId !== id)
		setWishlist(updated)
		localStorage.setItem('wishlist', JSON.stringify(updated))
	}

	const clearWishlist = () => {
		setWishlist([])
		localStorage.removeItem('wishlist')
	}

	return (
		<>
			{/* Overlay */}
			{open && (
				<div
					className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50'
					onClick={() => setOpen(false)} // overlay click yopadi
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 right-0 h-full w-80 sm:w-96 md:w-[450px] bg-white/40 dark:bg-gray-900/40 backdrop-blur-lg shadow-2xl z-60 transform transition-transform duration-300 rounded-l-3xl flex flex-col overflow-hidden ${
					open ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				{/* Header */}
				<div className='flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700'>
					<h2 className='text-lg font-bold text-gray-800 dark:text-gray-100'>
						My Wishlist
					</h2>
					<Button
						variant='ghost'
						size='icon'
						className='text-gray-500 hover:text-black dark:hover:text-white transition-colors'
						onClick={() => setOpen(false)} // button click yopadi
					>
						<X className='h-5 w-5' />
					</Button>
				</div>

				{/* Wishlist Items */}
				<div className='flex-1 overflow-y-auto p-4 space-y-4'>
					{wishlistProducts.length === 0 ? (
						<div className='text-center mt-10 text-gray-500 dark:text-gray-400'>
							Your wishlist is empty.
						</div>
					) : (
						wishlistProducts.map(product => (
							<Card
								key={product._id}
								className='flex flex-row items-center justify-between p-4 gap-4 shadow-lg hover:shadow-2xl transition-shadow rounded-2xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-md'
							>
								<img
									src={product.image || '/placeholder.svg'}
									alt={product.name}
									className='w-24 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0'
								/>
								<div className='flex-1 flex flex-col justify-center px-2 min-w-0'>
									<h3 className='font-semibold text-md text-gray-800 dark:text-gray-100 truncate'>
										{product.name}
									</h3>
									<p className='text-gray-900 dark:text-gray-100 font-bold mt-1 text-lg'>
										{product.price} UZS
									</p>
								</div>
								<div className='flex flex-col gap-4 flex-shrink-0 w-24 sm:w-28'>
									<Button
										onClick={() => onAddToCart(product)}
										variant='outline'
										size='icon'
										className='ml-auto'
									>
										<ShoppingCart className='h-4 w-4' />
									</Button>
									<Button
										variant='outline'
										size='icon'
										className='ml-auto'
										onClick={() => removeFromWishlist(product._id)}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							</Card>
						))
					)}
				</div>

				{/* Clear Wishlist */}
				{wishlistProducts.length > 0 && (
					<div className='p-4 border-t border-gray-200 dark:border-gray-700'>
						<Button
							variant='destructive'
							className='w-full bg-black text-white font-bold shadow-lg rounded-2xl hover:bg-gray-900 transition-all py-2'
							onClick={clearWishlist}
						>
							Clear Wishlist
						</Button>
					</div>
				)}
			</aside>
		</>
	)
}

'use client'
import { HeroSlider } from '@/components/hero-slider'
import { ProductCard } from '@/components/product-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import WishlistSidebar from '@/components/wishlist-sidebar'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	Heart,
	Languages,
	LogOut,
	Menu,
	Search,
	ShoppingCart,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SocialIcon } from 'react-social-icons'

export default function HomePage() {
	type Product = {
		_id: string
		name: string
		category: string
		price: number
		stock: number
		description: string
		image: string
		featured?: boolean
		rating?: number
	}

	type User = {
		id: string
		firstName: string
		lastName?: string
		email?: string
		role?: string
	}

	type CartItem = {
		productId: string
		quantity: number
	}
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [wishlistSidebarOpen, setWishlistSidebarOpen] = useState(false)
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('All')
	const [cartItems, setCartItems] = useState<CartItem[]>([])
	const [user, setUser] = useState<any>(null)
	const [products, setProducts] = useState<Product[]>([])
	const [wishlist, setWishlist] = useState<string[]>([])
	const router = useRouter()
	const cartIconRef = useRef<HTMLButtonElement | null>(null)
	const [flyingImages, setFlyingImages] = useState<
		{
			id: string
			src: string
			startX: number
			startY: number
			endX: number
			endY: number
		}[]
	>([])

	const categories = ['All', 'Electronics', 'Optoelectronics', 'Sensors', 'SMD']

	useEffect(() => {
		fetchProducts()
	}, [])

	const fetchProducts = async () => {
		try {
			setLoading(true)
			const res = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/products`
			)
			setProducts(res.data)
		} catch (err) {
			console.error('Mahsulotlarni olib bo‘lmadi', err)
		} finally {
			setLoading(false)
		}
	}

	const [firstName, setFirstName] = useState<string | null>(null)
	useEffect(() => {
		const u = Cookies.get('user')
		if (u) {
			try {
				const parsedUser = JSON.parse(u)
				setUser(parsedUser)
				setFirstName(parsedUser.firstName)
			} catch (e) {
				console.error('User parse error', e)
			}
		}
	}, [])

	const handleLogout = async () => {
		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
				{},
				{ withCredentials: true } // 🍪 cookie bilan ishlaydi
			)
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			Cookies.remove('token')
			Cookies.remove('user')
			setUser(null)
			router.push('/')
		}
	}

	const filteredProducts = products.filter(product => {
		const matchesSearch = product.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase())
		const matchesCategory =
			selectedCategory === 'All' || product.category === selectedCategory
		return matchesSearch && matchesCategory
	})

	const addToCart = async (
		productId: string,
		name: string,
		price: number,
		image: string,
		e?: React.MouseEvent<HTMLButtonElement>
	) => {
		const cookieUser = Cookies.get('user')
		const storedUser = cookieUser ? JSON.parse(cookieUser) : null
		console.log('cookieUser:', cookieUser)
		console.log('storedUser:', storedUser)
		if (storedUser && storedUser.id) {
			// Agar login qilingan bo‘lsa → serverga yozamiz
			const existing = cartItems.find(item => item.productId === productId)
			await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
				userId: storedUser.id,
				productId,
				quantity: existing ? existing.quantity + 1 : 1,
			})
		} else {
			// Guest foydalanuvchi → localStorage ga yozamiz
			const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
			const existing = localCart.find(
				(item: any) => item.productId === productId
			)

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
		}

		setCartItems(prev => {
			const existing = prev.find(item => item.productId === productId)
			if (existing) {
				return prev.map(item =>
					item.productId === productId
						? { ...item, quantity: item.quantity + 1 }
						: item
				)
			} else {
				return [...prev, { productId, quantity: 1 }]
			}
		})
		if (e && cartIconRef.current) {
			const productRect = (e.target as HTMLElement).getBoundingClientRect()
			const cartRect = cartIconRef.current.getBoundingClientRect()

			const newFly = {
				id: Date.now().toString(),
				src: image,
				startX: productRect.left,
				startY: productRect.top,
				endX: cartRect.left,
				endY: cartRect.top,
			}

			setFlyingImages(prev => [...prev, newFly])

			// 1 sekunddan keyin listdan o‘chiramiz
			setTimeout(() => {
				setFlyingImages(prev => prev.filter(f => f.id !== newFly.id))
			}, 1000)
		}
	}
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('wishlist')
			if (saved) setWishlist(JSON.parse(saved))
		}
	}, [])
	// wishlist toggle funksiyasi
	const toggleWishlist = (productId: string) => {
		setWishlist(prev => {
			const exists = prev.includes(productId)
			let updated
			if (exists) {
				updated = prev.filter(id => id !== productId)
			} else {
				updated = [...prev, productId]
			}
			localStorage.setItem('wishlist', JSON.stringify(updated))
			return updated
		})
	}

	const handleProductClick = (product: Product) => {
		console.log('Product clicked:', product)
	}

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('uz-UZ', {
			style: 'currency',
			currency: 'UZS',
			currencyDisplay: 'code', // har doim "UZS" bo‘ladi, "so‘m" emas
			minimumFractionDigits: 0,
		}).format(price)
	}
	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary'></div>
			</div>
		)
	}
	return (
		<div className='min-h-screen bg-background'>
			{/* Header */}
			<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<div className='flex items-center gap-6'>
							<Link
								href='/'
								className='flex items-center gap-2 px-0 py-0 my-0 mx-0'
							>
								<div className='h-8 w-8 rounded-lg flex items-center justify-center'>
									<img src='/logo.png' alt='logo' />
								</div>
								<span className='font-semibold text-lg'>OXA Electronics</span>
							</Link>
						</div>

						<div className='flex items-center gap-4'>
							<div className='hidden sm:flex items-center gap-2 max-w-sm'>
								<div className='relative flex-1'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
									<Input
										placeholder='Search products...'
										value={searchQuery}
										onChange={e => setSearchQuery(e.target.value)}
										className='pl-10 mx-1'
									/>
								</div>
							</div>

							<Button
								variant='ghost'
								onClick={() => setWishlistSidebarOpen(true)}
								className='flex items-center gap-2'
							>
								<Heart className='h-5 w-5' />
							</Button>

							<Link href='/cart'>
								<Button
									id='cart-icon'
									ref={cartIconRef}
									variant='ghost'
									size='icon'
									className='relative'
								>
									<ShoppingCart className='h-5 w-5' />
									{cartItems.length > 0 && (
										<Badge className='absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'>
											{cartItems.reduce(
												(sum, item) => sum + (item.quantity || 1),
												0
											)}
										</Badge>
									)}
								</Button>
							</Link>

							{user ? (
								<div className='hidden md:flex items-center gap-2'>
									<span className='text-sm text-strong'>
										Salom, {user.firstName}!
									</span>

									{user.role === 'admin' && (
										<Link href='/admin'>
											<Button variant='outline' size='sm'>
												Admin
											</Button>
										</Link>
									)}

									<Button variant='ghost' size='icon' onClick={handleLogout}>
										<LogOut className='h-5 w-5' />
									</Button>
								</div>
							) : (
								// ✅ Login har doim ko‘rinadi
								<Link href='/login'>
									<Button variant='ghost' size='icon'>
										<User className='h-5 w-5' />
									</Button>
								</Link>
							)}

							<Button
								variant='ghost'
								size='icon'
								className='md:hidden'
								onClick={() => setSidebarOpen(true)}
							>
								<Menu className='h-6 w-6' />
							</Button>
						</div>
					</div>
				</div>
			</header>
			{sidebarOpen && (
				<div
					onClick={() => setSidebarOpen(false)}
					className='fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden'
				/>
			)}

			{/* Overlay */}
			{sidebarOpen && (
				<div
					className='fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden'
					onClick={() => setSidebarOpen(false)} // bosganda yopiladi
				/>
			)}

			{/* Sidebar panel */}
			<div
				className={`fixed top-0 right-0 h-full w-64 
    bg-white/30 dark:bg-gray-800/30 
    backdrop-blur-lg shadow-xl 
    border-l border-white/20 dark:border-gray-700/20
    z-50 transform transition-transform duration-300 md:hidden ${
			sidebarOpen ? 'translate-x-0' : 'translate-x-full'
		}`}
			>
				<div className='flex flex-col h-full p-4'>
					<div className='flex justify-between items-center border-b pb-3'>
						<span className='font-semibold text-lg'>Menu</span>
						<button onClick={() => setSidebarOpen(false)}>✖</button>
					</div>

					<div className='flex flex-col mt-6 space-y-4'>
						{user?.role === 'admin' && (
							<Link
								href='/admin'
								className='px-4 py-2 bg-primary text-white rounded-lg text-center'
							>
								Admin Panel
							</Link>
						)}

						{user ? (
							<Button
								onClick={handleLogout}
								variant='outline'
								className='flex items-center gap-2'
							>
								<LogOut className='h-4 w-4' /> Logout
							</Button>
						) : (
							<Link
								href='/login'
								className='px-4 py-2 border rounded-lg text-center'
							>
								<User className='inline mr-2 h-4 w-4' /> Login
							</Link>
						)}

						<div className='mt-6'>
							<h4 className='text-sm mb-2 flex items-center gap-2'>
								<Languages className='h-4 w-4' /> Tilni tanlang:
							</h4>
							<div className='flex gap-2'>
								<Button size='sm' variant='outline'>
									🇺🇿 UZ
								</Button>
								<Button size='sm' variant='outline'>
									🇷🇺 RU
								</Button>
								<Button size='sm' variant='outline'>
									🇬🇧 EN
								</Button>
							</div>
						</div>
					</div>

					<div className='mt-auto text-xs text-muted-foreground'>
						© 2025 OXA electronics
					</div>
				</div>
			</div>
			<WishlistSidebar
				open={wishlistSidebarOpen}
				setOpen={setWishlistSidebarOpen}
				wishlist={wishlist}
				setWishlist={setWishlist}
				products={products}
				onAddToCart={(product: Product) =>
					addToCart(
						product._id,
						product.name,
						product.price,
						product.image || '/placeholder.svg'
					)
				}
			/>

			{/* Hero Section */}
			<HeroSlider />

			{/* Mobile Search */}
			<div className='sm:hidden p-4 border-b'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search products...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='pl-10'
					/>
				</div>
			</div>

			{/* Mobile Categories */}
			<div className=' p-4 border-b'>
				<div className='flex gap-2 overflow-x-auto'>
					{categories.map(category => (
						<Button
							key={category}
							variant={selectedCategory === category ? 'default' : 'outline'}
							size='sm'
							onClick={() => setSelectedCategory(category)}
							className='whitespace-nowrap'
						>
							{category}
						</Button>
					))}
				</div>
			</div>

			{/* Products Grid */}
			<main
				className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'
				id='electronics'
			>
				<div className='flex items-center justify-between mb-8'>
					<h2 className='text-2xl font-semibold'>
						{selectedCategory === 'All' ? 'All Products' : selectedCategory}
					</h2>
					<p className='text-muted-foreground'>
						{filteredProducts.length} product
						{filteredProducts.length !== 1 ? 's' : ''}
					</p>
				</div>

				<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
					{filteredProducts.map(product => (
						<ProductCard
							key={product._id}
							product={{
								...product,
								image_url: product.image || '/placeholder.svg',
								featured: product.featured?.toString() || 'false',
								rating: product.rating || 4.5,
							}}
							isWishlisted={wishlist.some(p => p._id === product._id)}
							onWishlistToggle={() => toggleWishlist(product._id)}
							onAddToCart={() =>
								addToCart(
									product._id,
									product.name,
									product.price,
									product.image || '/placeholder.svg'
								)
							}
							onProductClick={handleProductClick}
							formatPrice={formatPrice}
						/>
					))}
				</div>

				{filteredProducts.length === 0 && (
					<div className='text-center py-16'>
						<p className='text-muted-foreground text-lg'>
							No products found matching your criteria.
						</p>
					</div>
				)}
			</main>
			<div className='pointer-events-none fixed top-0 left-0 w-full h-full z-[9999]'>
				{flyingImages.map(f => (
					<img
						key={f.id}
						src={f.src}
						className='w-12 h-12 rounded-full object-cover absolute'
						style={{
							left: f.startX,
							top: f.startY,
							transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
							transform: `translate(${f.endX - f.startX}px, ${
								f.endY - f.startY
							}px) scale(0.3)`,
						}}
					/>
				))}
			</div>
			{/* Footer */}
			<footer className='bg-muted/50 mt-16'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className='h-8 w-8   flex items-center justify-center'>
									<img src='/logo.png' alt='loogo' />
								</div>
								<span className='font-semibold text-lg'>Oxa electronics</span>
							</div>
							<p className='text-muted-foreground'>
								Your trusted partner for premium products and exceptional
								shopping experience.
							</p>

							<div className='mt-4 flex gap-2'>
								<SocialIcon
									url='https://facebook.com/@oxaelectronics'
									style={{ height: 30, width: 30 }}
								/>
								<SocialIcon
									url='https://twitter.com/@oxaelectronics'
									style={{ height: 30, width: 30 }}
								/>
								<SocialIcon
									url='https://instagram.com/@oxaelectronics'
									style={{ height: 30, width: 30 }}
								/>
								<SocialIcon
									url='https://www.youtube.com/@oxaelectronics'
									style={{ height: 30, width: 30 }}
								/>
								<SocialIcon
									url='https://t.me/oxaelectronics'
									style={{ height: 30, width: 30 }}
								/>
							</div>
						</div>
						<div>
							<h3 className='font-semibold mb-4'>Oxa</h3>
							<ul className='space-y-2 text-muted-foreground'>
								<li>
									<Link href='#' className='hover:text-foreground'>
										Electronics
									</Link>
								</li>
								<li>
									<Link href='#' className='hover:text-foreground'>
										Optoelectronics
									</Link>
								</li>
								<li>
									<Link href='#' className='hover:text-foreground'>
										Sensors
									</Link>
								</li>
								<li>
									<Link href='#' className='hover:text-foreground'>
										SMD Components
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className='font-semibold mb-4'>Support</h3>
							<ul className='space-y-2 text-muted-foreground'>
								<li>
									<Link href='#' className='hover:text-foreground'>
										Contact Us
									</Link>
								</li>
								<li>
									<Link href='#' className='hover:text-foreground'>
										Shipping Info
									</Link>
								</li>
								<li>
									<Link href='#' className='hover:text-foreground'>
										Returns
									</Link>
								</li>
								<li>
									<Link href='#' className='hover:text-foreground'>
										FAQ
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className='font-semibold mb-4'>Company</h3>
							<ul className='space-y-2 text-muted-foreground'>
								<li>
									<Link href='#' className='hover:text-foreground'>
										About
									</Link>
								</li>
								<li>
									<Link href='#' className='hover:text-foreground'>
										Privacy
									</Link>
								</li>
								<li>
									<Link href='#' className='hover:text-foreground'>
										Terms
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className='border-t mt-8 pt-8 text-center text-muted-foreground'>
						<p>
							&copy; 2025 OXA electronics. Created by{' '}
							<a
								className='underline hover:text-foreground dark:hover:text-foreground ease-in-out duration-200'
								href='https://t.me/alianasia'
							>
								Durbegim
							</a>{' '}
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

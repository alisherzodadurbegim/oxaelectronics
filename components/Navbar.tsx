'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import WishlistSidebar from '@/components/wishlist-sidebar'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	Badge,
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

		if (storedUser && storedUser.id) {
			// 🟢 Login bo‘lgan user — backendga so‘rov
			try {
				const { data } = await axios.post<{
					items: { productId: { _id: string }; quantity: number }[]
				}>(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
					userId: storedUser.id,
					productId,
					quantity: 1,
				})

				setCartItems(
					data.items.map(item => ({
						productId: item.productId._id,
						quantity: item.quantity,
					}))
				)
			} catch (error) {
				console.error('Serverga cart yuborishda xato:', error)
			}
		} else {
			// 🟡 Guest user — localStorage
			const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as {
				productId: string
				name: string
				price: number
				image: string
				quantity: number
			}[]

			const existingIndex = localCart.findIndex(i => i.productId === productId)

			if (existingIndex > -1) {
				// mavjud bo‘lsa, quantity ni oshiramiz
				localCart[existingIndex].quantity += 1
			} else {
				// yangi mahsulot
				localCart.push({ productId, name, price, image, quantity: 1 })
			}

			localStorage.setItem('cart', JSON.stringify(localCart))
			setCartItems(
				localCart.map(item => ({
					productId: item.productId,
					quantity: item.quantity,
				}))
			)
		}

		// 🪄 Animatsiya (ixtiyoriy)
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

	return (
		<div>
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
		</div>
	)
}

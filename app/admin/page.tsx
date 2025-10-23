'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const formatPrice = (price: number) => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency: 'UZS',
		currencyDisplay: 'code', // har doim "UZS" bo‘ladi, "so‘m" emas
		minimumFractionDigits: 0,
	}).format(price)
}

// Icons
const PackageIcon = () => (
	<svg
		className='h-4 w-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
		/>
	</svg>
)
const ShoppingCartIcon = () => (
	<svg
		className='h-4 w-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z'
		/>
	</svg>
)
const UsersIcon = () => (
	<svg
		className='h-4 w-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z'
		/>
	</svg>
)
const DollarSignIcon = () => (
	<svg
		className='h-4 w-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
		/>
	</svg>
)
const TrendingUpIcon = () => (
	<svg
		className='h-4 w-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
		/>
	</svg>
)
const ArrowLeftIcon = () => (
	<svg
		className='h-5 w-5'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M10 19l-7-7m0 0l7-7m-7 7h18'
		/>
	</svg>
)
const PlusIcon = () => (
	<svg
		className='h-4 w-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M12 4v16m8-8H4'
		/>
	</svg>
)
const LogOutIcon = () => (
	<svg
		className='h-4 w-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
		/>
	</svg>
)

export default function AdminDashboardContent() {
	const [activeTab, setActiveTab] = useState('overview')
	const [orders, setOrders] = useState<any[]>([])
	const [products, setProducts] = useState<any[]>([])
	const [users, setUsers] = useState<any[]>([])
	const router = useRouter()

	// Backenddan ma'lumotlarni olish
	useEffect(() => {
		// Orders
		axios
			.get('/api/orders')
			.then(res => setOrders(res.data))
			.catch(err => console.error(err))

		// Products
		axios
			.get('/api/products')
			.then(res => setProducts(res.data))
			.catch(err => console.error(err))

		// Users
		axios
			.get('/api/admin/users')
			.then(res => setUsers(res.data))
			.catch(err => console.error(err))
	}, [])

	const stats = {
		totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
		totalOrders: orders.length,
		totalProducts: products.length,
		totalCustomers: users.length,
		revenueGrowth: 12.5, // optional, calculate if needed
		ordersGrowth: 8.3, // optional
	}

	const recentOrders = orders.slice(-3).reverse() // oxirgi 3 ta order

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800'
			case 'pending':
				return 'bg-yellow-100 text-yellow-800'
			case 'shipped':
				return 'bg-blue-100 text-blue-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	// Add missing variables for customers and activities
	const customerStats = {
		totalCustomers: users.filter((u: any) => u.role === 'customer').length,
		newCustomers: users.filter((u: any) => u.role === 'customer' && u.isNew)
			.length,
		returningCustomers: users.filter(
			(u: any) => u.role === 'customer' && u.isReturning
		).length,
	}

	const allUsers = users

	const activities: any[] = [] // Replace with actual activity data if available

	// Define topProducts by sorting products by sales and taking the top 3
	const topProducts = products
		.filter((p: any) => typeof p.sales === 'number')
		.sort((a: any, b: any) => b.sales - a.sales)
		.slice(0, 3)

	return (
		<div className='min-h-screen bg-background'>
			{/* Header */}
			<header className='border-b bg-card'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<div className='flex items-center gap-4'>
							<Link
								href='/'
								className='flex items-center gap-2 hover:text-primary'
							>
								<ArrowLeftIcon /> Back to Store
							</Link>
							<div className='h-6 w-px bg-border' />
							<h1 className='text-xl font-semibold'>Admin Dashboard</h1>
						</div>
						<div className='flex items-center gap-2'>
							<Link href='/admin/products'>
								<Button variant='outline' size='sm'>
									<PlusIcon /> Add Product
								</Button>
							</Link>
							<Button
								variant='outline'
								size='sm'
								onClick={() => {
									localStorage.removeItem('user')
									router.push('/')
								}}
							>
								<LogOutIcon /> Logout
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<Tabs
					value={activeTab}
					onValueChange={val => setActiveTab(val)}
					className='space-y-6'
				>
					<TabsList className='grid w-full grid-cols-4'>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger
							value='products'
							onClick={() => router.push('/admin/products')}
						>
							Products
						</TabsTrigger>
						<TabsTrigger
							value='orders'
							onClick={() => router.push('/admin/orders')}
						>
							Orders
						</TabsTrigger>
						<TabsTrigger value='customers'>Customers</TabsTrigger>
					</TabsList>

					<TabsContent value='overview' className='space-y-6'>
						{/* Stats Cards */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<Card>
								<CardHeader className='flex justify-between pb-2'>
									<CardTitle className='text-sm font-medium'>
										Total Revenue
									</CardTitle>
									<DollarSignIcon />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{new Intl.NumberFormat('uz-UZ', {
											style: 'currency',
											currency: 'UZS',
											currencyDisplay: 'code',
											minimumFractionDigits: 0,
										}).format(stats.totalRevenue)}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className='flex justify-between pb-2'>
									<CardTitle className='text-sm font-medium'>
										Total Orders
									</CardTitle>
									<ShoppingCartIcon />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>{stats.totalOrders}</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className='flex justify-between pb-2'>
									<CardTitle className='text-sm font-medium'>
										Total Products
									</CardTitle>
									<PackageIcon />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{stats.totalProducts}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className='flex justify-between pb-2'>
									<CardTitle className='text-sm font-medium'>
										Total Customers
									</CardTitle>
									<UsersIcon />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{stats.totalCustomers}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Recent Orders */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<ShoppingCartIcon /> Recent Orders
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{recentOrders.map(order => (
										<div
											key={order._id}
											className='flex justify-between p-3 border rounded-lg'
										>
											<div>
												<p className='font-medium'>{order.email}</p>
												<p className='text-sm text-muted-foreground'>
													{order.shippingAddress.firstName}{' '}
													{order.shippingAddress.lastName}
												</p>
												<p className='text-xs text-muted-foreground'>
													{new Date(order.createdAt).toLocaleDateString()}
												</p>
											</div>
											<div className='text-right'>
												<p className='font-medium'>
													{formatPrice(order.total)}
												</p>
												<Badge
													className={`text-xs ${getStatusColor(order.status)}`}
												>
													{order.status}
												</Badge>
											</div>
										</div>
									))}
								</div>
								<Link href='/admin/orders'>
									<Button variant='outline' className='w-full mt-4'>
										View All Orders
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Top Products */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<TrendingUpIcon />
									Top Products
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{topProducts.map(product => (
										<div
											key={product._id || product.id}
											className='flex items-center justify-between p-3 border rounded-lg'
										>
											<div>
												<p className='font-medium'>{product.name}</p>
												<p className='text-sm text-muted-foreground'>
													{product.sales} sales
												</p>
												<p className='text-xs text-muted-foreground'>
													Stock: {product.stock}
												</p>
											</div>
											<div className='text-right'>
												<p className='font-medium'>
													{new Intl.NumberFormat('uz-UZ', {
														style: 'currency',
														currency: 'UZS',
														currencyDisplay: 'code',
														minimumFractionDigits: 0,
													}).format(stats.totalRevenue)}
												</p>
												{product.stock < 10 && (
													<Badge variant='destructive' className='text-xs'>
														Low Stock
													</Badge>
												)}
											</div>
										</div>
									))}
								</div>
								<Link href='/admin/products'>
									<Button
										variant='outline'
										className='w-full mt-4 bg-transparent'
									>
										View All Products
									</Button>
								</Link>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='customers'>
						<div className='space-y-6'>
							{/* Customer Stats */}
							<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
								<Card>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											Total Customers
										</CardTitle>
										<UsersIcon />
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>
											{customerStats.totalCustomers}
										</div>
										<p className='text-xs text-muted-foreground'>
											Registered users
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											New Customers
										</CardTitle>
										<UsersIcon />
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>
											{customerStats.newCustomers}
										</div>
										<p className='text-xs text-muted-foreground'>
											First-time buyers
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											Returning Customers
										</CardTitle>
										<UsersIcon />
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>
											{customerStats.returningCustomers}
										</div>
										<p className='text-xs text-muted-foreground'>
											Repeat buyers
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Customer List */}
							<Card>
								<CardHeader>
									<CardTitle>Customer Management</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{allUsers
											.filter(user => user.role === 'customer')
											.map(user => (
												<div
													key={user._id}
													className='flex items-center justify-between p-4 border rounded-lg'
												>
													<div>
														<p className='font-medium'>
															{user.firstName} {user.lastName}
														</p>
														<p className='text-sm text-muted-foreground'>
															{user.email}
														</p>
														<p className='text-xs text-muted-foreground'>
															Joined:{' '}
															{new Date(user.createdAt).toLocaleDateString()}
														</p>
													</div>
													<div className='text-right'>
														<Badge variant='outline' className='capitalize'>
															{user.role}
														</Badge>
														<p className='text-sm text-muted-foreground mt-1'>
															Orders:{' '}
															{
																orders.filter(
																	order => order.customerEmail === user.email
																).length
															}
														</p>
													</div>
												</div>
											))}
										{allUsers.filter(user => user.role === 'customer')
											.length === 0 && (
											<div className='text-center py-8 text-muted-foreground'>
												No customers registered yet
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Recent Activity */}
							<Card>
								<CardHeader>
									<CardTitle>Recent User Activity</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										{activities.map(activity => (
											<div
												key={activity._id}
												className='flex items-center gap-3 p-3 border rounded-lg'
											>
												<div className='h-2 w-2 bg-green-500 rounded-full'></div>
												<div className='flex-1'>
													<p className='text-sm font-medium'>
														{activity.userName}
													</p>
													<p className='text-xs text-muted-foreground'>
														{activity.details}
													</p>
													<p className='text-xs text-muted-foreground'>
														{new Date(activity.timestamp).toLocaleString()}
													</p>
												</div>
												<Badge variant='outline' className='capitalize'>
													{activity.action.replace('_', ' ')}
												</Badge>
											</div>
										))}
										{activities.length === 0 && (
											<div className='text-center py-8 text-muted-foreground'>
												No recent activity
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import axios from 'axios'
import {
	ArrowLeft,
	Eye,
	MapPin,
	MessageSquare,
	MoreHorizontal,
	Package,
	Search,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type MaybeUser =
	| string
	| {
			_id?: string
			firstName?: string
			lastName?: string
			email?: string
	  }

type Order = {
	_id: string
	userId: MaybeUser
	items: {
		name: string
		price: number
		quantity: number
		image?: string
	}[]
	total: number
	status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
	paymentMethod: string
	paymentStatus: 'pending' | 'completed' | 'failed'
	shippingAddress: {
		firstName: string
		lastName: string
		address: string
		city: string
		state?: string
		zipCode: string
		country: string
		phone: string
		// email may not exist here — prefer userId.email if populated
		email?: string
	}
	createdAt: string
	updatedAt: string
}

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedStatus, setSelectedStatus] = useState('All')
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [showOrderDetails, setShowOrderDetails] = useState(false)

	useEffect(() => {
		fetchOrders()
	}, [])
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('uz-UZ', {
			style: 'currency',
			currency: 'UZS',
			currencyDisplay: 'code', // har doim "UZS" bo‘ladi, "so‘m" emas
			minimumFractionDigits: 0,
		}).format(price)
	}
	async function fetchOrders() {
		setLoading(true)
		try {
			// withCredentials true to send cookies (JWT) to backend
			const res = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
				{ withCredentials: true }
			)
			setOrders(res.data || [])
		} catch (err: any) {
			console.error('Orders fetch error:', err)
			// if 403 -> not admin or token issue
			if (err?.response?.status === 403) {
				console.warn('Not authorized to fetch orders (admin only).')
			}
		} finally {
			setLoading(false)
		}
	}

	const statuses = [
		'All',
		'pending',
		'processing',
		'shipped',
		'completed',
		'cancelled',
	]

	// helper: get customer name (prefer populated user, fallback to shippingAddress)
	function getCustomerName(order: Order) {
		if (order.userId && typeof order.userId === 'object') {
			const u = order.userId as any
			return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '(User)'
		}
		return `${order.shippingAddress?.firstName ?? ''} ${
			order.shippingAddress?.lastName ?? ''
		}`.trim()
	}
	function getCustomerEmail(order: Order) {
		if (order.userId && typeof order.userId === 'object') {
			return (order.userId as any).email ?? ''
		}
		return order.shippingAddress?.email ?? ''
	}

	const q = searchQuery.trim().toLowerCase()
	// filter by search + status
	const filteredOrders = orders
		.filter(order => {
			// if no query -> keep
			if (!q) return true
			const id = String(order._id ?? '').toLowerCase()
			const name = getCustomerName(order).toLowerCase()
			const email = getCustomerEmail(order).toLowerCase()
			return id.includes(q) || name.includes(q) || email.includes(q)
		})
		.filter(
			order => selectedStatus === 'All' || order.status === selectedStatus
		)

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800'
			case 'pending':
				return 'bg-yellow-100 text-yellow-800'
			case 'processing':
				return 'bg-blue-100 text-blue-800'
			case 'shipped':
				return 'bg-purple-100 text-purple-800'
			case 'cancelled':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const getPaymentStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800'
			case 'pending':
				return 'bg-yellow-100 text-yellow-800'
			case 'failed':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const handleStatusUpdate = async (orderId: string, newStatus: string) => {
		try {
			const res = await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,

				{ status: newStatus },
				{ withCredentials: true }
			)
			// res.data contains updated order
			setOrders(prev => prev.map(o => (o._id === orderId ? res.data : o)))
		} catch (err) {
			console.error('Update error:', err)
			alert('Order status update failed')
		}
	}

	const handleViewDetails = (order: Order) => {
		setSelectedOrder(order)
		setShowOrderDetails(true)
	}

	const handleSendTelegram = (order: Order) => {
		const message = `Order Update: ${order._id}\nCustomer: ${getCustomerName(
			order
		)}\nStatus: ${order.status}\nTotal: $${order.total}`
		alert(`Telegram message would be sent:\n\n${message}`)
	}

	return (
		<div className='min-h-screen bg-background'>
			<header className='border-b bg-card'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<div className='flex items-center gap-4'>
							<Link
								href='/admin'
								className='flex items-center gap-2 hover:text-primary'
							>
								<ArrowLeft className='h-5 w-5' />
								<span>Back to Dashboard</span>
							</Link>
							<div className='h-6 w-px bg-border' />
							<h1 className='text-xl font-semibold'>Order Management</h1>
						</div>
					</div>
				</div>
			</header>

			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<Card className='mb-6'>
					<CardContent className='p-6'>
						<div className='flex flex-col sm:flex-row gap-4'>
							<div className='relative flex-1'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Search orders, customers, or emails...'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className='pl-10'
								/>
							</div>
							<div className='flex gap-2 flex-wrap'>
								{statuses.map(status => (
									<Button
										key={status}
										variant={selectedStatus === status ? 'default' : 'outline'}
										size='sm'
										onClick={() => setSelectedStatus(status)}
										className='capitalize'
									>
										{status}
									</Button>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center justify-between'>
							Orders
							<Badge variant='secondary'>{filteredOrders.length} orders</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className='text-center py-12'>Loading orders...</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Order ID</TableHead>
										<TableHead>Customer</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Items</TableHead>
										<TableHead>Total</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead className='w-[50px]'></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredOrders.map(order => (
										<TableRow key={order._id}>
											<TableCell className='font-medium'>{order._id}</TableCell>
											<TableCell>
												<div>
													<p className='font-medium'>
														{getCustomerName(order)}
													</p>
													<p className='text-sm text-muted-foreground'>
														{getCustomerEmail(order)}
													</p>
												</div>
											</TableCell>
											<TableCell>
												{new Date(order.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>{order.items.length} items</TableCell>
											<TableCell className='font-medium'>
												{formatPrice(order.total)}
											</TableCell>
											<TableCell>
												<Badge
													className={`capitalize ${getStatusColor(
														order.status
													)}`}
												>
													{order.status}
												</Badge>
											</TableCell>
											<TableCell>
												<div>
													<span className='text-sm text-muted-foreground'>
														{order.paymentMethod}
													</span>
													<Badge
														className={`ml-2 text-xs ${getPaymentStatusColor(
															order.paymentStatus
														)}`}
													>
														{order.paymentStatus}
													</Badge>
												</div>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<button>
															<MoreHorizontal className='h-4 w-4' />
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															onClick={() => handleViewDetails(order)}
														>
															<Eye className='h-4 w-4 mr-2' />
															View Details
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusUpdate(order._id, 'processing')
															}
														>
															<Package className='h-4 w-4 mr-2' />
															Mark Processing
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusUpdate(order._id, 'shipped')
															}
														>
															<Package className='h-4 w-4 mr-2' />
															Mark Shipped
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusUpdate(order._id, 'completed')
															}
														>
															<Package className='h-4 w-4 mr-2' />
															Mark Completed
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleSendTelegram(order)}
														>
															<MessageSquare className='h-4 w-4 mr-2' />
															Send Telegram
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
									{filteredOrders.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={8}
												className='text-center py-8 text-muted-foreground'
											>
												No orders found matching your criteria
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			<Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
				<DialogContent
					className='
      w-full 
      max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 
      max-h-[90vh] overflow-y-auto 
      p-3 sm:p-6
      rounded-lg
    '
				>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2 text-base sm:text-lg'>
							<Package className='h-5 w-5' />
							Order Details - {selectedOrder?._id}
						</DialogTitle>
					</DialogHeader>

					{selectedOrder && (
						<div className='space-y-4 sm:space-y-6 pb-6'>
							{/* Status / Payment / Total */}
							<div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
								<Card className='text-center'>
									<CardContent className='p-3 sm:p-4'>
										<p className='text-xs sm:text-sm text-muted-foreground'>
											Order Status
										</p>
										<Badge
											className={`mt-1 ${getStatusColor(selectedOrder.status)}`}
										>
											{selectedOrder.status}
										</Badge>
									</CardContent>
								</Card>
								<Card className='text-center'>
									<CardContent className='p-3 sm:p-4'>
										<p className='text-xs sm:text-sm text-muted-foreground'>
											Payment Status
										</p>
										<Badge
											className={`mt-1 ${getPaymentStatusColor(
												selectedOrder.paymentStatus
											)}`}
										>
											{selectedOrder.paymentStatus}
										</Badge>
									</CardContent>
								</Card>
								<Card className='text-center'>
									<CardContent className='p-3 sm:p-4'>
										<p className='text-xs sm:text-sm text-muted-foreground'>
											Total Amount
										</p>
										<p className='text-lg sm:text-xl font-bold text-primary mt-1'>
											{formatPrice(selectedOrder.total)}
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Customer + Shipping */}
							<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
								{/* Customer Info */}
								<Card>
									<CardHeader>
										<CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
											<User className='h-4 w-4' /> Customer Information
										</CardTitle>
									</CardHeader>
									<CardContent className='text-sm sm:text-base'>
										<p className='text-xs text-muted-foreground'>Name</p>
										<p className='font-medium'>
											{getCustomerName(selectedOrder)}
										</p>
										<p className='text-xs text-muted-foreground mt-2'>Email</p>
										<p className='font-medium'>
											{getCustomerEmail(selectedOrder)}
										</p>
										<p className='text-xs text-muted-foreground mt-2'>
											Order Date
										</p>
										<p className='font-medium'>
											{new Date(selectedOrder.createdAt).toLocaleString()}
										</p>
									</CardContent>
								</Card>

								{/* Shipping Info */}
								<Card>
									<CardHeader>
										<CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
											<MapPin className='h-4 w-4' /> Shipping Address
										</CardTitle>
									</CardHeader>
									<CardContent className='text-sm sm:text-base'>
										<p className='text-xs text-muted-foreground'>Full Name</p>
										<p className='font-medium'>
											{selectedOrder.shippingAddress.firstName}{' '}
											{selectedOrder.shippingAddress.lastName}
										</p>
										<p className='text-xs text-muted-foreground mt-2'>Phone</p>
										<p className='font-medium'>
											{selectedOrder.shippingAddress.phone || 'Not provided'}
										</p>
										<p className='text-xs text-muted-foreground mt-2'>
											Address
										</p>
										<p className='font-medium'>
											{selectedOrder.shippingAddress.address}
											<br />
											{selectedOrder.shippingAddress.city},{' '}
											{selectedOrder.shippingAddress.state}{' '}
											{selectedOrder.shippingAddress.zipCode}
											<br />
											{selectedOrder.shippingAddress.country}
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Items */}
							<Card>
								<CardHeader>
									<CardTitle className='text-sm sm:text-base'>
										Order Items
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3 sm:space-y-4'>
										{selectedOrder.items.map((item, idx) => (
											<div
												key={idx}
												className='flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg'
											>
												<img
													src={item.image || '/placeholder.svg'}
													alt={item.name}
													className='w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg'
												/>
												<div className='flex-1'>
													<p className='font-medium text-sm sm:text-base'>
														{item.name}
													</p>
													<p className='text-xs sm:text-sm text-muted-foreground'>
														{formatPrice(item.price)} × {item.quantity}
													</p>
												</div>
												<div className='text-right'>
													<p className='font-medium text-sm sm:text-base'>
														{formatPrice(item.price * item.quantity)}
													</p>
												</div>
											</div>
										))}
										<div className='border-t pt-3 sm:pt-4'>
											<div className='flex justify-between items-center text-sm sm:text-lg font-semibold'>
												<span>Total Amount</span>
												<span className='text-primary'>
													{formatPrice(selectedOrder.total)}
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Actions */}
							<div className='flex flex-wrap gap-2'>
								<Button
									size='sm'
									onClick={() =>
										handleStatusUpdate(selectedOrder._id, 'processing')
									}
									disabled={selectedOrder.status === 'processing'}
								>
									Mark Processing
								</Button>
								<Button
									size='sm'
									onClick={() =>
										handleStatusUpdate(selectedOrder._id, 'shipped')
									}
									disabled={
										selectedOrder.status === 'shipped' ||
										selectedOrder.status === 'completed'
									}
								>
									Mark Shipped
								</Button>
								<Button
									size='sm'
									onClick={() =>
										handleStatusUpdate(selectedOrder._id, 'completed')
									}
									disabled={selectedOrder.status === 'completed'}
								>
									Mark Completed
								</Button>
								<Button
									size='sm'
									variant='outline'
									onClick={() => handleSendTelegram(selectedOrder)}
								>
									<MessageSquare className='h-4 w-4 mr-2' /> Send Telegram
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}

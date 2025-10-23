export interface OrderItem {
	id: number
	name: string
	price: number
	quantity: number
	image: string
}

export interface ShippingAddress {
	firstName: string
	lastName: string
	email: string
	phone: string
	address: string
	city: string
	state: string
	zipCode: string
	country: string
}

export interface Order {
	id: string
	userId: string
	customerName: string
	customerEmail: string
	items: OrderItem[]
	total: number
	status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
	paymentMethod: string
	paymentStatus: 'pending' | 'completed' | 'failed'
	shippingAddress: ShippingAddress
	createdAt: string
	updatedAt: string
}

export interface UserActivity {
	id: string
	userId: string
	userEmail: string
	userName: string
	action: 'login' | 'logout' | 'register' | 'order_placed' | 'payment_completed'
	details: string
	timestamp: string
	ipAddress?: string
}

export class OrderStore {
	private static instance: OrderStore
	private orders: Order[] = []
	private activities: UserActivity[] = []
	private storageKey = 'oxa_orders'
	private activityKey = 'oxa_activities'

	private constructor() {
		this.loadData()
		this.initializeMockData()
	}

	static getInstance(): OrderStore {
		if (!OrderStore.instance) {
			OrderStore.instance = new OrderStore()
		}
		return OrderStore.instance
	}

	private loadData() {
		if (typeof window !== 'undefined') {
			// Load orders
			const storedOrders = localStorage.getItem(this.storageKey)
			if (storedOrders) {
				try {
					this.orders = JSON.parse(storedOrders)
				} catch (error) {
					console.error('Failed to parse stored orders:', error)
					this.orders = []
				}
			}

			// Load activities
			const storedActivities = localStorage.getItem(this.activityKey)
			if (storedActivities) {
				try {
					this.activities = JSON.parse(storedActivities)
				} catch (error) {
					console.error('Failed to parse stored activities:', error)
					this.activities = []
				}
			}
		}
	}

	private saveData() {
		if (typeof window !== 'undefined') {
			localStorage.setItem(this.storageKey, JSON.stringify(this.orders))
			localStorage.setItem(this.activityKey, JSON.stringify(this.activities))
		}
	}

	private initializeMockData() {
		if (this.orders.length === 0) {
			const mockOrders: Order[] = [
				{
					id: 'ORD-001',
					userId: 'user-1',
					customerName: 'John Doe',
					customerEmail: 'john@example.com',
					items: [
						{
							id: 1,
							name: 'Premium Wireless Headphones',
							price: 299.99,
							quantity: 1,
							image: '/premium-wireless-headphones.png',
						},
					],
					total: 329.98,
					status: 'completed',
					paymentMethod: 'Bank Transfer',
					paymentStatus: 'completed',
					shippingAddress: {
						firstName: 'John',
						lastName: 'Doe',
						email: 'john@example.com',
						phone: '+1234567890',
						address: '123 Main St',
						city: 'New York',
						state: 'NY',
						zipCode: '10001',
						country: 'USA',
					},
					createdAt: '2025-01-15T10:30:00Z',
					updatedAt: '2025-01-15T14:30:00Z',
				},
				{
					id: 'ORD-002',
					userId: 'user-2',
					customerName: 'Jane Smith',
					customerEmail: 'jane@example.com',
					items: [
						{
							id: 2,
							name: 'Organic Cotton T-Shirt',
							price: 29.99,
							quantity: 2,
							image:
								'https://uelectronics.com/wp-content/uploads/2025/09/AR4624-Kit-Unit-Fuente-12V-2A-con-case-v4-768x768.webp',
						},
					],
					total: 59.98,
					status: 'pending',
					paymentMethod: 'Bank Transfer',
					paymentStatus: 'pending',
					shippingAddress: {
						firstName: 'Jane',
						lastName: 'Smith',
						email: 'jane@example.com',
						phone: '+1234567891',
						address: '456 Oak Ave',
						city: 'Los Angeles',
						state: 'CA',
						zipCode: '90210',
						country: 'USA',
					},
					createdAt: '2025-01-15T09:15:00Z',
					updatedAt: '2025-01-15T09:15:00Z',
				},
			]

			this.orders = mockOrders
			this.saveData()
		}

		if (this.activities.length === 0) {
			const mockActivities: UserActivity[] = [
				{
					id: 'act-1',
					userId: 'admin-001',
					userEmail: 'alianasiaglobal@gmail.com',
					userName: 'Admin User',
					action: 'login',
					details: 'Admin logged in to dashboard',
					timestamp: new Date().toISOString(),
				},
				{
					id: 'act-2',
					userId: 'user-1',
					userEmail: 'john@example.com',
					userName: 'John Doe',
					action: 'order_placed',
					details: 'Order ORD-001 placed for $329.98',
					timestamp: '2025-01-15T10:30:00Z',
				},
			]

			this.activities = mockActivities
			this.saveData()
		}
	}

	// Order methods
	addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
		const newOrder: Order = {
			...order,
			id: `ORD-${String(this.orders.length + 1).padStart(3, '0')}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		this.orders.unshift(newOrder)
		this.saveData()

		// Log activity
		this.logActivity({
			userId: order.userId,
			userEmail: order.customerEmail,
			userName: order.customerName,
			action: 'order_placed',
			details: `Order ${newOrder.id} placed for $${order.total}`,
		})

		return newOrder
	}

	getOrders(): Order[] {
		return this.orders
	}

	getOrderById(id: string): Order | null {
		return this.orders.find(order => order.id === id) || null
	}

	updateOrderStatus(id: string, status: Order['status']): boolean {
		const orderIndex = this.orders.findIndex(order => order.id === id)
		if (orderIndex === -1) return false

		this.orders[orderIndex].status = status
		this.orders[orderIndex].updatedAt = new Date().toISOString()
		this.saveData()

		// Log activity
		this.logActivity({
			userId: 'admin-001',
			userEmail: 'alianasiaglobal@gmail.com',
			userName: 'Admin User',
			action: 'order_placed',
			details: `Order ${id} status updated to ${status}`,
		})

		return true
	}

	// Activity methods
	logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): void {
		const newActivity: UserActivity = {
			...activity,
			id: `act-${Date.now()}`,
			timestamp: new Date().toISOString(),
		}

		this.activities.unshift(newActivity)

		// Keep only last 1000 activities
		if (this.activities.length > 1000) {
			this.activities = this.activities.slice(0, 1000)
		}

		this.saveData()
	}

	getActivities(): UserActivity[] {
		return this.activities
	}

	getRecentActivities(limit = 10): UserActivity[] {
		return this.activities.slice(0, limit)
	}

	// Analytics methods
	getOrderStats() {
		const totalOrders = this.orders.length
		const totalRevenue = this.orders
			.filter(order => order.status === 'completed')
			.reduce((sum, order) => sum + order.total, 0)

		const pendingOrders = this.orders.filter(
			order => order.status === 'pending'
		).length
		const completedOrders = this.orders.filter(
			order => order.status === 'completed'
		).length

		return {
			totalOrders,
			totalRevenue,
			pendingOrders,
			completedOrders,
			averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
		}
	}

	getCustomerStats() {
		const uniqueCustomers = new Set(
			this.orders.map(order => order.customerEmail)
		).size
		const returningCustomers = this.orders.reduce((acc, order) => {
			const customerOrders = this.orders.filter(
				o => o.customerEmail === order.customerEmail
			)
			if (customerOrders.length > 1) {
				acc.add(order.customerEmail)
			}
			return acc
		}, new Set()).size

		return {
			totalCustomers: uniqueCustomers,
			returningCustomers,
			newCustomers: uniqueCustomers - returningCustomers,
		}
	}
}

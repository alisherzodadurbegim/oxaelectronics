'use client'

import { SuccessModal } from '@/components/success-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
export default function ProductsPage() {
	type Product = {
		_id: string
		name: string
		category: string
		price: number
		stock: number
		description: string
		image: string
	}
	const [products, setProducts] = useState<Product[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('All')
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [showSuccessModal, setShowSuccessModal] = useState(false)
	const [successMessage, setSuccessMessage] = useState({
		title: '',
		message: '',
	})
	const [formData, setFormData] = useState({
		name: '',
		category: '',
		price: '',
		stock: '',
		description: '',
		image: '',
	})
	const [formErrors, setFormErrors] = useState<Record<string, string>>({})

	const categories = ['All', 'Electronics', 'Optoelectronics', 'Sensors', 'SMD']

	useEffect(() => {
		fetchProducts()
	}, [])

	const fetchProducts = async () => {
		try {
			const res = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/products`
			)
			setProducts(res.data)
		} catch (err) {
			console.error('Mahsulotlarni olib bo‘lmadi', err)
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

	const getStockStatus = (stock: number) => {
		if (stock === 0)
			return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
		if (stock < 10)
			return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
		return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
	}

	const validateForm = () => {
		const errors: Record<string, string> = {}

		if (!formData.name.trim()) {
			errors.name = 'Product name is required'
		}
		if (!formData.category) {
			errors.category = 'Category is required'
		}
		if (
			!formData.price ||
			isNaN(Number(formData.price)) ||
			Number(formData.price) <= 0
		) {
			errors.price = 'Valid price is required'
		}
		if (
			!formData.stock ||
			isNaN(Number(formData.stock)) ||
			Number(formData.stock) < 0
		) {
			errors.stock = 'Valid stock quantity is required'
		}

		setFormErrors(errors)
		return Object.keys(errors).length === 0
	}

	const handleAddProduct = async () => {
		if (!validateForm()) return

		const productData = {
			name: formData.name,
			category: formData.category,
			price: Number(formData.price),
			stock: Number(formData.stock),
			description: formData.description,
			image: formData.image || '/placeholder.svg',
		}

		try {
			const res = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`,
				productData,
				{ withCredentials: true }
			)
			console.log(res.data)
			setProducts([...products, res.data])
			resetForm()
			setIsAddDialogOpen(false)

			setSuccessMessage({
				title: 'Product Added Successfully!',
				message: `${res.data.name} added successfully.`,
			})
			setShowSuccessModal(true)
		} catch (err) {
			console.error('Mahsulot qo‘shilmadi', err)
		}
	}

	const handleEditProduct = async () => {
		if (!editingProduct || !validateForm()) return

		const updatedData = {
			name: formData.name,
			category: formData.category,
			price: Number(formData.price),
			stock: Number(formData.stock),
			description: formData.description,
			image: formData.image || editingProduct.image,
		}

		try {
			const res = await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${editingProduct._id}`,
				updatedData,
				{ withCredentials: true }
			)

			setProducts(
				products.map(p => (p._id === editingProduct._id ? res.data : p))
			)
			resetForm()
			setIsEditDialogOpen(false)

			setSuccessMessage({
				title: 'Product Updated Successfully!',
				message: `${res.data.name} updated successfully.`,
			})
			setShowSuccessModal(true)
		} catch (err) {
			console.error('Mahsulot yangilanmadi', err)
		}
	}

	const handleDeleteProduct = async (productId: string) => {
		const product = products.find(p => p._id === productId)
		if (!product) return

		if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
			try {
				await axios.delete(
					`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}`,
					{ withCredentials: true }
				)
				setProducts(products.filter(p => p._id !== productId))
				setSuccessMessage({
					title: 'Product Deleted Successfully!',
					message: `${product.name} deleted successfully.`,
				})
				setShowSuccessModal(true)
			} catch (err) {
				console.error('Mahsulot o‘chirilmadi', err)
			}
		}
	}

	const openEditDialog = (product: Product) => {
		setEditingProduct(product)
		setFormData({
			name: product.name,
			category: product.category,
			price: product.price.toString(),
			stock: product.stock.toString(),
			description: product.description || '',
			image: product.image,
		})
		setFormErrors({})
		setIsEditDialogOpen(true)
	}

	const resetForm = () => {
		setFormData({
			name: '',
			category: '',
			price: '',
			stock: '',
			description: '',
			image: '',
		})
		setFormErrors({})
		setEditingProduct(null)
	}

	return (
		<div className='min-h-screen bg-background'>
			{/* Header */}
			<header className='border-b bg-card'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<div className='flex items-center gap-4'>
							<Link
								href='/admin'
								className='flex items-center gap-2 hover:text-primary'
							>
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
										d='M15 19l-7-7 7-7'
									/>
								</svg>
								<span>Back to Dashboard</span>
							</Link>
							<div className='h-6 w-px bg-border' />
							<h1 className='text-xl font-semibold'>Product Management</h1>
						</div>
						{/* Add Product Dialog */}
						<Dialog
							open={isAddDialogOpen}
							onOpenChange={open => {
								setIsAddDialogOpen(open)
								if (!open) resetForm()
							}}
						>
							<DialogTrigger asChild>
								<Button>
									<svg
										className='h-4 w-4 mr-2'
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
									Add Product
								</Button>
							</DialogTrigger>

							<DialogContent className='max-w-md'>
								<DialogHeader>
									<DialogTitle>Add New Product</DialogTitle>
								</DialogHeader>

								<div className='space-y-4'>
									{/* Name */}
									<div>
										<Label htmlFor='name'>Product Name *</Label>
										<Input
											id='name'
											value={formData.name}
											onChange={e => {
												setFormData({ ...formData, name: e.target.value })
												if (formErrors.name)
													setFormErrors({ ...formErrors, name: '' })
											}}
											placeholder='Enter product name'
											className={
												formErrors.name
													? 'border-red-500 focus:border-red-500'
													: ''
											}
										/>
										{formErrors.name && (
											<div className='flex items-center gap-1 mt-1 text-red-600'>
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
														d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
													/>
												</svg>
												<span className='text-sm'>{formErrors.name}</span>
											</div>
										)}
									</div>

									{/* Category */}
									<div>
										<Label htmlFor='category'>Category *</Label>
										<Select
											value={formData.category}
											onValueChange={value => {
												setFormData({ ...formData, category: value })
												if (formErrors.category)
													setFormErrors({ ...formErrors, category: '' })
											}}
										>
											<SelectTrigger
												className={
													formErrors.category
														? 'border-red-500 focus:border-red-500'
														: ''
												}
											>
												<SelectValue placeholder='Select category' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='Electronics'>Electronics</SelectItem>
												<SelectItem value='Optoelectronics'>
													Optoelectronics
												</SelectItem>
												<SelectItem value='Sensors'>Sensors</SelectItem>
												<SelectItem value='SMD'>SMD</SelectItem>
											</SelectContent>
										</Select>
										{formErrors.category && (
											<div className='mt-1 text-sm text-red-600'>
												{formErrors.category}
											</div>
										)}
									</div>

									{/* Price & Stock */}
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<Label htmlFor='price'>Price *</Label>
											<Input
												id='price'
												type='number'
												step='0.01'
												value={formData.price}
												onChange={e => {
													setFormData({ ...formData, price: e.target.value })
													if (formErrors.price)
														setFormErrors({ ...formErrors, price: '' })
												}}
												placeholder='0.00'
												className={
													formErrors.price
														? 'border-red-500 focus:border-red-500'
														: ''
												}
											/>
											{formErrors.price && (
												<div className='mt-1 text-sm text-red-600'>
													{formErrors.price}
												</div>
											)}
										</div>

										<div>
											<Label htmlFor='stock'>Stock *</Label>
											<Input
												id='stock'
												type='number'
												value={formData.stock}
												onChange={e => {
													setFormData({ ...formData, stock: e.target.value })
													if (formErrors.stock)
														setFormErrors({ ...formErrors, stock: '' })
												}}
												placeholder='0'
												className={
													formErrors.stock
														? 'border-red-500 focus:border-red-500'
														: ''
												}
											/>
											{formErrors.stock && (
												<div className='mt-1 text-sm text-red-600'>
													{formErrors.stock}
												</div>
											)}
										</div>
									</div>

									{/* Description */}
									<div>
										<Label htmlFor='description'>Description</Label>
										<Textarea
											id='description'
											value={formData.description}
											onChange={e =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											placeholder='Product description'
										/>
									</div>

									{/* Upload block (glassmorphism style) */}
									<div className=''>
										<Label className='block mb-2'>Upload Product Image</Label>

										<div
											className='relative flex items-center gap-3 p-4 border border-white/10 rounded-2xl
                     bg-gradient-to-r from-white/3 to-white/6 backdrop-blur-md cursor-pointer
                     hover:shadow-lg transition'
										>
											<div className='flex items-center gap-3'>
												<UploadCloud className='w-6 h-6 text-muted-foreground' />
												<div className='text-sm text-muted-foreground'>
													Click to choose or drag & drop image
												</div>
											</div>

											{/* Invisible native file input placed over the block */}
											<Input
												id='image'
												type='file'
												accept='image/*'
												className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
												onChange={async e => {
													const file = e.target.files?.[0]
													if (!file) return

													const formDataFile = new FormData()
													formDataFile.append('image', file)

													try {
														const res = await axios.post(
															`${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
															formDataFile,
															{
																headers: {
																	'Content-Type': 'multipart/form-data',
																},
															}
														)
														// backenddan imageUrl qaytariladi: /uploads/....
														setFormData(prev => ({
															...prev,
															image: res.data.imageUrl,
														}))
													} catch (err) {
														console.error('Rasm yuklashda xatolik:', err)
														// optional: set some UI error state
													}
												}}
											/>
										</div>

										{/* Preview + filename */}
										{formData.image && (
											<div className='mt-3 flex items-center gap-3'>
												<img
													src={`${
														typeof window !== 'undefined'
															? window.location.origin
															: ''
													}${formData.image}`}
													alt='Preview'
													className='w-28 h-28 object-cover rounded-xl border'
												/>
												<div className='text-sm'>
													<div className='font-medium'>
														{formData.image.split('/').pop()}
													</div>
													<div className='text-muted-foreground text-xs'>
														Uploaded
													</div>
												</div>
											</div>
										)}
									</div>

									{/* Actions */}
									<div className='flex gap-2 pt-4'>
										<Button
											onClick={handleAddProduct}
											className='flex-1 bg-gradient-to-r from-black-500 to-grey-600 text-white'
										>
											Add Product
										</Button>
										<Button
											variant='outline'
											onClick={() => setIsAddDialogOpen(false)}
										>
											Cancel
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</header>

			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Filters */}
				<Card className='mb-6'>
					<CardContent className='p-6'>
						<div className='flex flex-col sm:flex-row gap-4'>
							<div className='relative flex-1'>
								<svg
									className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
									/>
								</svg>
								<Input
									placeholder='Search products...'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className='pl-10'
								/>
							</div>
							<div className='flex gap-2'>
								{categories.map(category => (
									<Button
										key={category}
										variant={
											selectedCategory === category ? 'default' : 'outline'
										}
										size='sm'
										onClick={() => setSelectedCategory(category)}
									>
										{category}
									</Button>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Products Table */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center justify-between'>
							Products
							<Badge variant='secondary'>
								{filteredProducts.length} products
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Product</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Stock</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className='w-[50px]'></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredProducts.map(product => {
									const stockStatus = getStockStatus(product.stock)
									return (
										<TableRow key={product._id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<img
														src={product.image || '/placeholder.svg'}
														alt={product.name}
														className='w-10 h-10 rounded-lg object-cover'
													/>
													<div>
														<p className='font-medium'>{product.name}</p>
														<p className='text-sm text-muted-foreground'>
															ID: {product._id}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant='outline'>{product.category}</Badge>
											</TableCell>
											<TableCell className='font-medium'>
												{product.price} UZS
											</TableCell>
											<TableCell>{product.stock}</TableCell>
											<TableCell>
												<Badge className={stockStatus.color}>
													{stockStatus.label}
												</Badge>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<button>
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
																	d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z'
																/>
															</svg>
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															onClick={() => openEditDialog(product)}
														>
															<svg
																className='h-4 w-4 mr-2'
																fill='none'
																stroke='currentColor'
																viewBox='0 0 24 24'
															>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	strokeWidth={2}
																	d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
																/>
															</svg>
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															className='text-destructive'
															onClick={() => handleDeleteProduct(product._id)}
														>
															<svg
																className='h-4 w-4 mr-2'
																fill='none'
																stroke='currentColor'
																viewBox='0 0 24 24'
															>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	strokeWidth={2}
																	d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
																/>
															</svg>
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Edit Dialog with same validation structure */}
			<Dialog
				open={isEditDialogOpen}
				onOpenChange={open => {
					setIsEditDialogOpen(open)
					if (!open) resetForm()
				}}
			>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Edit Product</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<Label htmlFor='edit-name'>Product Name *</Label>
							<Input
								id='edit-name'
								value={formData.name}
								onChange={e => {
									setFormData({ ...formData, name: e.target.value })
									if (formErrors.name)
										setFormErrors({ ...formErrors, name: '' })
								}}
								placeholder='Enter product name'
								className={
									formErrors.name ? 'border-red-500 focus:border-red-500' : ''
								}
							/>
							{formErrors.name && (
								<div className='flex items-center gap-1 mt-1'>
									<svg
										className='h-4 w-4 text-red-500'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
									<span className='text-sm text-red-600'>
										{formErrors.name}
									</span>
								</div>
							)}
						</div>
						<div>
							<Label htmlFor='edit-category'>Category *</Label>
							<Select
								value={formData.category}
								onValueChange={value => {
									setFormData({ ...formData, category: value })
									if (formErrors.category)
										setFormErrors({ ...formErrors, category: '' })
								}}
							>
								<SelectTrigger
									className={
										formErrors.category
											? 'border-red-500 focus:border-red-500'
											: ''
									}
								>
									<SelectValue placeholder='Select category' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='Electronics'>Electronics</SelectItem>
									<SelectItem value='Optoelectronics'>
										Optoelectronics
									</SelectItem>
									<SelectItem value='Sensors'>Sensors</SelectItem>
									<SelectItem value='SMD'>SMD</SelectItem>
								</SelectContent>
							</Select>
							{formErrors.category && (
								<div className='flex items-center gap-1 mt-1'>
									<svg
										className='h-4 w-4 text-red-500'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
									<span className='text-sm text-red-600'>
										{formErrors.category}
									</span>
								</div>
							)}
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-price'>Price *</Label>
								<Input
									id='edit-price'
									type='number'
									step='0.01'
									value={formData.price}
									onChange={e => {
										setFormData({ ...formData, price: e.target.value })
										if (formErrors.price)
											setFormErrors({ ...formErrors, price: '' })
									}}
									placeholder='0.00'
									className={
										formErrors.price
											? 'border-red-500 focus:border-red-500'
											: ''
									}
								/>
								{formErrors.price && (
									<div className='flex items-center gap-1 mt-1'>
										<svg
											className='h-4 w-4 text-red-500'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
										<span className='text-sm text-red-600'>
											{formErrors.price}
										</span>
									</div>
								)}
							</div>
							<div>
								<Label htmlFor='edit-stock'>Stock *</Label>
								<Input
									id='edit-stock'
									type='number'
									value={formData.stock}
									onChange={e => {
										setFormData({ ...formData, stock: e.target.value })
										if (formErrors.stock)
											setFormErrors({ ...formErrors, stock: '' })
									}}
									placeholder='0'
									className={
										formErrors.stock
											? 'border-red-500 focus:border-red-500'
											: ''
									}
								/>
								{formErrors.stock && (
									<div className='flex items-center gap-1 mt-1'>
										<svg
											className='h-4 w-4 text-red-500'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
										<span className='text-sm text-red-600'>
											{formErrors.stock}
										</span>
									</div>
								)}
							</div>
						</div>
						<div>
							<Label htmlFor='edit-description'>Description</Label>
							<Textarea
								id='edit-description'
								value={formData.description}
								onChange={e =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder='Product description'
							/>
						</div>
						<div>
							<Label htmlFor='edit-image'>Image URL</Label>
							<Input
								id='edit-image'
								value={formData.image}
								onChange={e =>
									setFormData({ ...formData, image: e.target.value })
								}
								placeholder='https://example.com/image.jpg'
							/>
						</div>
						<div className='flex gap-2 pt-4'>
							<Button onClick={handleEditProduct} className='flex-1'>
								Update Product
							</Button>
							<Button
								variant='outline'
								onClick={() => setIsEditDialogOpen(false)}
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<SuccessModal
				isOpen={showSuccessModal}
				onClose={() => setShowSuccessModal(false)}
				title={successMessage.title}
				message={successMessage.message}
			/>
		</div>
	)
}

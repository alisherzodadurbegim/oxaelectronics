'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SlideContent {
	type: 'image'
	src: string
	title: string
	subtitle: string
	buttonText: string
	buttonLink: string
}

const slides: SlideContent[] = [
	{
		type: 'image',
		src: '/slider1.png',
		title: 'Welcome to OXA Electronics',
		subtitle:
			'The latest electronic products — all in one placeShop now and experience the power of technology',

		buttonText: 'Register Now',
		buttonLink: '/login',
	},
	{
		type: 'image',
		src: '/slider2.png',
		title: 'Transistors more electronics',
		subtitle:
			'Discover cutting-edge electronics designed for performance and innovation.From transistors to smart devices — everything you need in one place.',

		buttonText: 'Shop Fashion',
		buttonLink: '#clothing',
	},
	{
		type: 'image',
		src: '/silder3.png',
		title: 'SMD Components',
		subtitle:
			'Create the perfect living space with our premium home decor and furniture collection',
		buttonText: 'Shop Home',
		buttonLink: '#home',
	},
	{
		type: 'image',
		src: '/slider4.png',
		title: 'Compact. Reliable. Efficient.',
		subtitle:
			'Explore our newest electronic components and smart devices.Shop today and power your next big idea!',

		buttonText: 'Shop Accessories',
		buttonLink: '#accessories',
	},
	{
		type: 'image',
		src: '/slider5.png',
		title: 'Precision in Every Circuit',
		subtitle:
			'High-quality PCB design and manufacturing for reliable performance and innovation.',
		buttonText: 'View Deals',
		buttonLink: '#deals',
	},
]

export function HeroSlider() {
	const [currentSlide, setCurrentSlide] = useState(0)
	const [isPlaying, setIsPlaying] = useState(true)
	const [isVideoPlaying, setIsVideoPlaying] = useState(false)
	const router = useRouter()

	useEffect(() => {
		if (!isPlaying) return

		const interval = setInterval(() => {
			setCurrentSlide(prev => (prev + 1) % slides.length)
		}, 5000) // Change slide every 5 seconds

		return () => clearInterval(interval)
	}, [isPlaying])

	const goToSlide = (index: number) => {
		setCurrentSlide(index)
	}

	const goToPrevious = () => {
		setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
	}

	const goToNext = () => {
		setCurrentSlide(prev => (prev + 1) % slides.length)
	}

	const toggleAutoplay = () => {
		setIsPlaying(!isPlaying)
	}

	const currentSlideData = slides[currentSlide]

	return (
		<section className='relative h-[70vh] sm:h-[50vh]  lg:h-[70vh] overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10'>
			{/* Slide Container */}
			<div className='relative h-full w-full'>
				{slides.map((slide, index) => (
					<div
						key={index}
						className={`absolute inset-0 transition-opacity duration-1000 ${
							index === currentSlide ? 'opacity-100' : 'opacity-0'
						}`}
					>
						{slide.type === 'image' ? (
							<div
								className='h-full w-full bg-cover sm:bg-contain bg-center bg-no-repeat bg-black'
								style={{
									backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.src})`,
								}}
							/>
						) : (
							<div className='relative h-full w-full'>
								<div
									className='h-full w-full bg-cover bg-center bg-no-repeat'
									style={{
										backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.src})`,
									}}
								/>
							</div>
						)}
					</div>
				))}

				{/* Content Overlay */}
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
						<div className='text-center max-w-4xl mx-auto text-white'>
							<h1 className='text-4xl md:text-6xl lg:text-7xl font-bold opacity-90 text-balance mb-6 drop-shadow-lg'>
								{currentSlideData.title}
							</h1>
							<p className='text-lg md:text-xl lg:text-2xl text-pretty mb-8 drop-shadow-md opacity-90'>
								{currentSlideData.subtitle}
							</p>
							<Button
								size='lg'
								className='text-lg px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300'
								onClick={() => router.push(currentSlideData.buttonLink)}
							>
								{currentSlideData.buttonText}
							</Button>
						</div>
					</div>
				</div>

				{/* Navigation Arrows */}
				<Button
					variant='ghost'
					size='icon'
					className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 w-12 h-12'
					onClick={goToPrevious}
				>
					<ChevronLeft className='h-6 w-6' />
				</Button>
				<Button
					variant='ghost'
					size='icon'
					className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 w-12 h-12'
					onClick={goToNext}
				>
					<ChevronRight className='h-6 w-6' />
				</Button>

				{/* Slide Indicators */}
				<div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
					{slides.map((_, index) => (
						<button
							key={index}
							className={`w-3 h-3 rounded-full transition-all duration-300 ${
								index === currentSlide
									? 'bg-white scale-125'
									: 'bg-white/50 hover:bg-white/75'
							}`}
							onClick={() => goToSlide(index)}
						/>
					))}
				</div>

				{/* Autoplay Control */}
				<Button
					variant='ghost'
					size='icon'
					className='absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30'
					onClick={toggleAutoplay}
				>
					{isPlaying ? (
						<Pause className='h-4 w-4' />
					) : (
						<Play className='h-4 w-4' />
					)}
				</Button>
			</div>

			{/* Progress Bar */}
			<div className='absolute bottom-0 left-0 w-full h-1 bg-white/20'>
				<div
					className='h-full bg-white transition-all duration-100 ease-linear'
					style={{
						width: isPlaying ? '100%' : '0%',
						animation: isPlaying ? 'progress 5s linear infinite' : 'none',
					}}
				/>
			</div>

			<style jsx>{`
				@keyframes progress {
					from {
						width: 0%;
					}
					to {
						width: 100%;
					}
				}
			`}</style>
		</section>
	)
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'

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

interface AuthGuardProps {
	children: React.ReactNode
	requireAuth?: boolean
	requireAdmin?: boolean
	redirectTo?: string
}

export default function AuthGuard({
	children,
	requireAuth = false,
	requireAdmin = false,
	redirectTo = '/login',
}: AuthGuardProps) {
	const [isLoading, setIsLoading] = useState(true)
	const [isAuthorized, setIsAuthorized] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await axios.get('/api/auth/me')

				const user = res.data.user

				if (requireAdmin && user.role !== 'admin') {
					router.push('/login')
					return
				}

				if (requireAuth && !user.email) {
					router.push(redirectTo)
					return
				}

				setIsAuthorized(true)
			} catch (err) {
				console.error('Auth check failed:', err)
				if (requireAuth || requireAdmin) {
					router.push(redirectTo)
					return
				}
				setIsAuthorized(true)
			} finally {
				setIsLoading(false)
			}
		}

		checkAuth()
	}, [requireAuth, requireAdmin, redirectTo, router])

	if (isLoading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<Card>
					<CardContent className='p-6'>
						<div className='flex items-center gap-2'>
							<LoaderIcon />
							<span>loading...</span>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!isAuthorized) {
		return null
	}

	return <>{children}</>
}

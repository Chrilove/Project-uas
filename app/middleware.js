// app/middleware.js - ADD RATE LIMITING
import { NextResponse } from 'next/server'

// Simple rate limiting store (use Redis in production)
const rateLimitStore = new Map()

function rateLimit(ip, limit = 10, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, [])
  }
  
  const requests = rateLimitStore.get(ip).filter(time => time > windowStart)
  
  if (requests.length >= limit) {
    return false
  }
  
  requests.push(now)
  rateLimitStore.set(ip, requests)
  return true
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Rate limit login attempts
  if (pathname === '/login' && request.method === 'POST') {
    if (!rateLimit(ip, 5, 60000)) { // 5 attempts per minute
      return new NextResponse('Too many requests', { status: 429 })
    }
  }
  
  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value
  const userRole = request.cookies.get('user-role')?.value

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/']
  
  // Admin-only routes
  const adminRoutes = ['/products', '/orders', '/verification', '/shipping', '/reports', '/display', '/payment']
  
  // Check if current path is public
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Check if current path is admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  
  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If user is authenticated but trying to access login page
  if (token && pathname === '/login') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    } else if (userRole === 'reseller') {
      return NextResponse.redirect(new URL('/reseller', request.url))
    }
  }
  
  // If reseller trying to access admin routes
  if (token && userRole === 'reseller' && isAdminRoute) {
    return NextResponse.redirect(new URL('/reseller', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
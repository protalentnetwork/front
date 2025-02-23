import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth',  // Necesario para que funcione NextAuth
]

// Rutas de API que no deben ser redirigidas
const apiRoutes = [
  '/api/'
]

export async function middleware(request: NextRequest) {
  const session = await auth()
  const path = request.nextUrl.pathname

  // No aplicar redirecciones a rutas de API
  if (apiRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    path.startsWith(route) || path === route
  )

  // Si es una ruta pública y el usuario está autenticado, redirigir al dashboard
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si no es una ruta pública y el usuario no está autenticado, redirigir al login
  if (!isPublicRoute && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar rutas administrativas
  if (path.startsWith('/admin') && session?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configurar el matcher para todas las rutas excepto archivos estáticos y api routes de NextAuth
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
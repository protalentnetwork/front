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

// Rutas accesibles solo para admin
const adminOnlyRoutes = [
  '/dashboard/users',
  '/dashboard/transfer-accounts',
  '/dashboard/reports',
  '/dashboard/office-configuration',
  '/dashboard/whatsapp-recovery',
  '/dashboard/download-accounts',
  '/dashboard/landing-history',
]

// Rutas accesibles para operadores
const operatorRoutes = [
  '/dashboard',  // Página base del dashboard
  '/dashboard/tickets',
  '/dashboard/chat',
]

// Rutas accesibles para encargados
const encargadoRoutes = [
  '/dashboard',  // Página base del dashboard
  '/dashboard/web-monitoring',
  '/dashboard/transfer-monitoring',
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

  // Control de acceso basado en roles para rutas del dashboard
  if (path.startsWith('/dashboard')) {
    const userRole = session?.user?.role

    // Restringir acceso a rutas de admin para usuarios que no son admin
    if (userRole !== 'admin') {
      // Verificar si el usuario está intentando acceder a una ruta solo para admin
      const isAttemptingAdminRoute = adminOnlyRoutes.some(route => 
        path.startsWith(route) || path === route
      )

      if (isAttemptingAdminRoute) {
        // Si es operador, redirigir a la página de tickets
        if (userRole === 'operador') {
          return NextResponse.redirect(new URL('/dashboard/tickets', request.url))
        }
        // Si es encargado, redirigir a la página de monitoreo web
        if (userRole === 'encargado') {
          return NextResponse.redirect(new URL('/dashboard/web-monitoring', request.url))
        }
        // Para otros roles, redirigir al dashboard (que a su vez redirigirá según la lógica de la app)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Si es operador, verificar que solo acceda a sus rutas permitidas
    if (userRole === 'operador') {
      const isAllowedOperatorRoute = operatorRoutes.some(route => 
        path.startsWith(route) || path === route
      )

      if (!isAllowedOperatorRoute) {
        return NextResponse.redirect(new URL('/dashboard/tickets', request.url))
      }
    }

    // Si es encargado, verificar que solo acceda a sus rutas permitidas
    if (userRole === 'encargado') {
      const isAllowedEncargadoRoute = encargadoRoutes.some(route => 
        path.startsWith(route) || path === route
      )

      if (!isAllowedEncargadoRoute) {
        return NextResponse.redirect(new URL('/dashboard/web-monitoring', request.url))
      }
    }
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
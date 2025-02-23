import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      // Si requiere auth y no está autenticado, redirigir a login
      router.push('/auth/login');
    } else if (!requireAuth && status === 'authenticated') {
      // Si no requiere auth (como la página de login) y está autenticado, redirigir a dashboard
      router.push('/dashboard');
    }
  }, [status, requireAuth, router]);

  return {
    user: session?.user,
    isAdmin: session?.user?.role === 'admin',
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated'
  };
} 
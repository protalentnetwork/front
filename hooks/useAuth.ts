import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (!requireAuth && status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, requireAuth, router]);

  const logout = () => {
    signOut({ redirect: false });
  }

  return {
    user: session?.user,
    role: session?.user?.role,
    isAdmin: session?.user?.role === 'admin',
    isManager: session?.user?.role === 'encargado',
    isOperator: session?.user?.role === 'operador',
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    logout
  };
}
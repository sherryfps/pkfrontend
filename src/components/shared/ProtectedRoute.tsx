import { Navigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    const roleRoutes: Record<UserRole, string> = {
      ADMIN: '/admin/dashboard',
      AGENT: '/agent/dashboard',
      ACCOUNTANT: '/accountant/dashboard',
      DESIGNER: '/designer/dashboard',
    }
    return <Navigate to={roleRoutes[user.role]} replace />
  }

  return <>{children}</>
}

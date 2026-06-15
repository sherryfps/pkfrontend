import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import AuthLayout from '@/components/layout/AuthLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageLoader from '@/components/ui/PageLoader'
import CreateId from '@/pages/admin/createid/createId'

// Auth Pages
const Login = lazy(() => import('@/pages/auth/Login'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard/AdminDashboard'))
const AdminOrders = lazy(() => import('@/pages/admin/orders/OrdersPage'))
const AdminCustomers = lazy(() => import('@/pages/admin/customers/CustomersPage'))
const AdminInventory = lazy(() => import('@/pages/admin/inventory/InventoryPage'))
const AdminProducts = lazy(() => import('@/pages/admin/products/ProductsPage'))
const AdminUsers = lazy(() => import('@/pages/admin/users/UsersPage'))
const AdminAnalytics = lazy(() => import('@/pages/admin/analytics/AnalyticsPage'))
const AdminProduction = lazy(() => import('@/pages/admin/production/ProductionPage'))
const AdminDispatch = lazy(() => import('@/pages/admin/dispatch/DispatchPage'))
const AdminPayments = lazy(() => import('@/pages/admin/payments/PaymentsPage'))
const AdminSettings = lazy(() => import('@/pages/admin/settings/SettingsPage'))

// Agent Pages
const AgentDashboard = lazy(() => import('@/pages/agent/dashboard/AgentDashboard'))
const AgentOrders = lazy(() => import('@/pages/agent/orders/AgentOrders'))
const AgentCatalog = lazy(() => import('@/pages/agent/catalog/CatalogPage'))
const AgentCustomers = lazy(() => import('@/pages/agent/customers/AgentCustomers'))
const AgentPerformance = lazy(() => import('@/pages/agent/performance/AgentPerformance'))

// Accountant Pages
const AccountantDashboard = lazy(() => import('@/pages/accountant/dashboard/AccountantDashboard'))
const AccountantPayments = lazy(() => import('@/pages/accountant/payments/PaymentsPage'))
const AccountantInvoices = lazy(() => import('@/pages/accountant/invoices/InvoicesPage'))
const AccountantReports = lazy(() => import('@/pages/accountant/reports/ReportsPage'))

// Designer Pages
const DesignerDashboard = lazy(() => import('@/pages/designer/dashboard/DesignerDashboard'))
const DesignerOrders = lazy(() => import('@/pages/designer/orders/DesignerOrders'))
const DesignerMockups = lazy(() => import('@/pages/designer/mockups/MockupsPage'))

// Public Pages
const OrderTracking = lazy(() => import('@/pages/public/OrderTracking'))

export default function App() {
  const { user } = useAuthStore()
  const { isDark } = useThemeStore()

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const getDefaultRoute = () => {
    if (!user) return '/auth/login'
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard'
      case 'AGENT': return '/agent/dashboard'
      case 'ACCOUNTANT': return '/accountant/dashboard'
      case 'DESIGNER': return '/designer/dashboard'
      default: return '/auth/login'
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Public Tracking Routes */}
        <Route path="/track" element={<OrderTracking />} />
        <Route path="/track/:token" element={<OrderTracking />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout role="ADMIN" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="production" element={<AdminProduction />} />
          <Route path="dispatch" element={<AdminDispatch />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Create ID routes — inside admin layout so sidebar/header shows */}
          <Route path="createid/agent" element={<CreateId role="AGENT" />} />
          <Route path="createid/accountant" element={<CreateId role="ACCOUNTANT" />} />
          <Route path="createid/designer" element={<CreateId role="DESIGNER" />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={
          <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
            <DashboardLayout role="AGENT" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="orders" element={<AgentOrders />} />
          <Route path="catalog" element={<AgentCatalog />} />
          <Route path="customers" element={<AgentCustomers />} />
          <Route path="performance" element={<AgentPerformance />} />
        </Route>

        {/* Accountant Routes */}
        <Route path="/accountant" element={
          <ProtectedRoute allowedRoles={['ACCOUNTANT', 'ADMIN']}>
            <DashboardLayout role="ACCOUNTANT" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AccountantDashboard />} />
          <Route path="payments" element={<AccountantPayments />} />
          <Route path="invoices" element={<AccountantInvoices />} />
          <Route path="reports" element={<AccountantReports />} />
        </Route>

        {/* Designer Routes */}
        <Route path="/designer" element={
          <ProtectedRoute allowedRoles={['DESIGNER', 'ADMIN']}>
            <DashboardLayout role="DESIGNER" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DesignerDashboard />} />
          <Route path="orders" element={<DesignerOrders />} />
          <Route path="mockups" element={<DesignerMockups />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Suspense>
  )
}

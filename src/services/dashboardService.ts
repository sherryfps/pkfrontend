import apiClient from './apiClient'

export interface MonthlyRevenuePoint {
  month: string
  revenue: number
  orders: number
}

export interface AdminRecentOrder {
  id: string
  customer: string
  qty: number
  amount: string
  status: string
  agent: string
  date: string
}

export interface AdminStatsResponse {
  totalRevenue: number
  monthRevenue: number
  activeOrders: number
  pendingPayments: number
  inProduction: number
  dispatchReady: number
  totalCustomers: number
  completedThisMonth: number
  monthlyRevenue: MonthlyRevenuePoint[]
  recentOrders: AdminRecentOrder[]
}

export interface AgentStatsResponse {
  ordersThisMonth: number
  commissionThisMonth: number
  totalCustomers: number
  revenueGenerated: number
  commissionTrend: { month: string; commission: number }[]
  recentOrders: { id: string; customer: string; qty: number; amount: string; status: string; date: string }[]
}

export interface DesignerStatsResponse {
  assignedOrders: number
  mockupsPending: number
  approvedThisMonth: number
  avgTurnaround: string
  orders: {
    id: string; dbId: string; customer: string; qty: number
    deadline: string; status: string; priority: string
    notes: string; mockupUploaded: boolean
  }[]
}

export const dashboardService = {
  getAdminDashboard: async (): Promise<AdminStatsResponse> => {
    const res = await apiClient.get('/v1/dashboard/admin')
    return res.data?.data ?? res.data
  },

  getAgentDashboard: async (): Promise<AgentStatsResponse> => {
    const res = await apiClient.get('/v1/dashboard/agent')
    return res.data?.data ?? res.data
  },

  getDesignerDashboard: async (): Promise<DesignerStatsResponse> => {
    const res = await apiClient.get('/v1/dashboard/designer')
    return res.data?.data ?? res.data
  },
}

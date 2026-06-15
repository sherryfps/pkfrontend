import apiClient from './apiClient'

export interface CustomerResponse {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  gstin?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  active: boolean
  notes?: string
  agentId?: string
  agentName?: string
  createdAt: string
  updatedAt?: string
}

export interface PageableResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export interface CreateCustomerRequest {
  name: string
  email: string
  phone: string
  company?: string
  gstin?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  notes?: string
}

export const customerService = {
  createCustomer: async (data: CreateCustomerRequest): Promise<CustomerResponse> => {
    const res = await apiClient.post('/v1/customers', data)
    return res.data?.data ?? res.data
  },

  getCustomers: async (query?: string, page: number = 0, size: number = 10): Promise<PageableResponse<CustomerResponse>> => {
    const params: any = { page, size }
    if (query) params.query = query
    const res = await apiClient.get('/v1/customers', { params })
    return res.data?.data ?? res.data
  }
}

import apiClient from './apiClient'

export interface OrderItemRequest {
  productId: string
  colorHex: string
  colorName: string
  printType: string
  embroideryDetails?: string
  designPosition?: string
  customText?: string
  sizeQuantities: { size: string; quantity: number }[]
}

export interface CreateOrderRequest {
  customerId: string
  items: OrderItemRequest[]
  customerNotes?: string
  internalNotes?: string
  expectedDeliveryDate?: string
  customerGstin?: string
}

export interface CustomerInfo {
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
}

export interface AgentInfo {
  id: string
  name: string
  email: string
}

export interface DesignerInfo {
  id: string
  name: string
}

export interface OrderItemResponse {
  id: string
  productName: string
  productCode: string
  colorHex: string
  colorName: string
  printType: string
  sizeQuantities: string // JSON String from backend
  totalQuantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderResponse {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  customer: CustomerInfo
  agent: AgentInfo
  designer?: DesignerInfo
  subtotal: number
  gstAmount: number
  totalAmount: number
  advanceAmount: number
  balanceAmount: number
  paidAmount: number
  gstRate: string
  customerNotes?: string
  internalNotes?: string
  trackingToken: string
  customerLogoUrls: string[]
  referenceFileUrls: string[]
  mockupFileUrls: string[]
  expectedDeliveryDate?: string
  createdAt: string
  updatedAt?: string
  items: OrderItemResponse[]
}

export interface PageableResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export const orderService = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const res = await apiClient.post('/v1/orders', data)
    return res.data?.data ?? res.data
  },

  getAllOrders: async (page: number = 0, size: number = 20): Promise<PageableResponse<OrderResponse>> => {
    const res = await apiClient.get('/v1/orders', { params: { page, size } })
    return res.data?.data ?? res.data
  },

  getMyOrders: async (page: number = 0, size: number = 20): Promise<PageableResponse<OrderResponse>> => {
    const res = await apiClient.get('/v1/orders/my', { params: { page, size } })
    return res.data?.data ?? res.data
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    const res = await apiClient.get(`/v1/orders/${id}`)
    return res.data?.data ?? res.data
  },

  trackOrder: async (token: string): Promise<OrderResponse> => {
    const res = await apiClient.get(`/v1/orders/track/${token}`)
    return res.data?.data ?? res.data
  },

  updateStatus: async (id: string, status: string): Promise<OrderResponse> => {
    const res = await apiClient.patch(`/v1/orders/${id}/status`, null, { params: { status } })
    return res.data?.data ?? res.data
  },

  assignDesigner: async (id: string, designerId: string): Promise<OrderResponse> => {
    const res = await apiClient.patch(`/v1/orders/${id}/assign-designer`, null, { params: { designerId } })
    return res.data?.data ?? res.data
  },

  uploadLogos: async (id: string, files: File[]): Promise<OrderResponse> => {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    const res = await apiClient.post(`/v1/orders/${id}/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data?.data ?? res.data
  },

  uploadReferences: async (id: string, files: File[]): Promise<OrderResponse> => {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    const res = await apiClient.post(`/v1/orders/${id}/upload-references`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data?.data ?? res.data
  },

  uploadMockups: async (id: string, files: File[]): Promise<OrderResponse> => {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    const res = await apiClient.post(`/v1/orders/${id}/upload-mockups`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data?.data ?? res.data
  },

  createPaymentOrder: async (orderId: string, paymentType: string): Promise<any> => {
    const res = await apiClient.post('/v1/payments/create-order', { orderId, paymentType })
    return res.data?.data ?? res.data
  },

  verifyPayment: async (payload: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
    orderId: string
    paymentType: string
  }): Promise<any> => {
    const res = await apiClient.post('/v1/payments/verify', payload)
    return res.data?.data ?? res.data
  }
}

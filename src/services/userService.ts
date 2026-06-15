import apiClient from './apiClient'

export interface CreateUserRequest {
  name: string
  email: string
  phoneNumber: string
  gender: string
  password: string
  role: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  active: boolean
  createdAt: string
}

export const userService = {
  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    const res = await apiClient.post('/v1/users', data)
    // The backend wraps responses in ApiResponse<T>; unwrap the data field
    return res.data?.data ?? res.data
  },

  getUsers: async (role?: string): Promise<UserResponse[]> => {
    const params = role ? { role } : {}
    const res = await apiClient.get('/v1/users', { params })
    return res.data?.data ?? res.data ?? []
  },

  deactivateUser: async (id: string): Promise<UserResponse> => {
    const res = await apiClient.patch(`/v1/users/${id}/deactivate`)
    return res.data?.data ?? res.data
  },

  activateUser: async (id: string): Promise<UserResponse> => {
    const res = await apiClient.patch(`/v1/users/${id}/activate`)
    return res.data?.data ?? res.data
  },
}

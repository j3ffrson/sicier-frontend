import apiClient from './apiClient'

export const authApi = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password })
    return response.data
  },

  register: async (data) => {
    const response = await apiClient.post('/auth/sign', data)
    return response.data
  },

  updateUser: async (id, data) => {
    const response = await apiClient.post(`/auth/update/user/${id}`, data)
    return response.data
  },

  listUser: async () => {
    const response = await apiClient.get(`/auth/list/user`)
    return response.data
  },

  userPerfil: async () => {
    const response = await apiClient.get(`/auth/find/user/loged`)
    return response.data
  },

  findById: async (id) => {
    const response = await apiClient.get(`/auth/user/${id}`)
    return response.data
  }
}

import apiClient from './apiClient'

export const requestApi = {
  // Crear solicitud a un area
  createToArea: async (data) => {
    const response = await apiClient.post('/request/area', data)
    return response.data
  },

  listByUser: async (page = 0, size = 50) => {
    const response = await apiClient.get('/request/user/list', {
      params: { page, size },
    })
    return response.data
  },

  listByUserDestination: async (page = 0, size = 50) => {
    const response = await apiClient.get('/request/user/destination/list', {
      params: { page, size },
    })
    return response.data
  },

  // Crear solicitud a un usuario
  createToUser: async (data) => {
    const response = await apiClient.post('/request/user', data)
    return response.data
  },

  // Responder a una solicitud
  reply: async (id, data) => {
    const response = await apiClient.post(`/request/reply/${id}`, data)
    return response.data
  },
}

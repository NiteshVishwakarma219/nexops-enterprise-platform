import api from './api'

export const listAssets = (params) => api.get('/assets', { params })
export const getAsset = (id) => api.get(`/assets/${id}`)
export const createAsset = (data) => api.post('/assets', data)
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data)
export const deleteAsset = (id) => api.delete(`/assets/${id}`)

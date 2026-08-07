import api from './api'

export const listLeaves = (params) => api.get('/leaves', { params })
export const applyLeave = (data) => api.post('/leaves', data)
export const reviewLeave = (id, data) => api.put(`/leaves/${id}/review`, data)
export const cancelLeave = (id) => api.put(`/leaves/${id}/cancel`)

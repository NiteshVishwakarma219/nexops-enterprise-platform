import api from './api'

export const getMyProfile = () => api.get('/users/me')
export const updateMyProfile = (data) => api.put('/users/me', data)
export const changePassword = (data) => api.post('/users/me/change-password', data)
export const listUsers = (params) => api.get('/users', { params })

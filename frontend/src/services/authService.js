import api from './api'

export const login = (email, password) => api.post('/auth/login', { email, password })
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (email, otp, new_password) => api.post('/auth/reset-password', { email, otp, new_password })

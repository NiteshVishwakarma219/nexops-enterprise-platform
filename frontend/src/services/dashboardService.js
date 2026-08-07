import api from './api'

export const getDashboardStats = () => api.get('/dashboard/stats')
export const getDepartmentDistribution = () => api.get('/dashboard/department-distribution')
export const getAttendanceTrend = (days = 7) => api.get('/dashboard/attendance-trend', { params: { days } })
export const getRecentActivities = (limit = 8) => api.get('/dashboard/recent-activities', { params: { limit } })

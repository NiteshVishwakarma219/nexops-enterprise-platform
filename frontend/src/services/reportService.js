import api from './api'

export const getHeadcountByDepartment = () => api.get('/reports/headcount-by-department')
export const getEmployeeStatusBreakdown = () => api.get('/reports/employee-status-breakdown')
export const getLeaveTypeBreakdown = () => api.get('/reports/leave-type-breakdown')
export const getAssetCategoryBreakdown = () => api.get('/reports/asset-category-breakdown')
export const getAttendanceStatusBreakdown = () => api.get('/reports/attendance-status-breakdown')

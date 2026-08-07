import api from './api'

export const listEmployees = (params) => api.get('/employees', { params })
export const getEmployee = (id) => api.get(`/employees/${id}`)
export const createEmployee = (data) => api.post('/employees', data)
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data)
export const deleteEmployee = (id) => api.delete(`/employees/${id}`)
export const uploadEmployeeDocument = (id, docType, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/employees/${id}/documents/${docType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

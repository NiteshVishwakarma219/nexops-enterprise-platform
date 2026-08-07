import api from './api'

export const listProjects = (params) => api.get('/projects', { params })
export const getProject = (id) => api.get(`/projects/${id}`)
export const createProject = (data) => api.post('/projects', data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)
export const addProjectMember = (id, data) => api.post(`/projects/${id}/members`, data)
export const removeProjectMember = (id, employeeId) => api.delete(`/projects/${id}/members/${employeeId}`)

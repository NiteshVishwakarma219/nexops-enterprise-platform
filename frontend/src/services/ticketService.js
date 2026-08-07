import api from './api'

export const listTickets = (params) => api.get('/tickets', { params })
export const getTicket = (id) => api.get(`/tickets/${id}`)
export const createTicket = (data) => api.post('/tickets', data)
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data)
export const deleteTicket = (id) => api.delete(`/tickets/${id}`)
export const addTicketComment = (id, message) => api.post(`/tickets/${id}/comments`, { message })

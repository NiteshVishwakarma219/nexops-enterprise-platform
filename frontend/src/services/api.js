/**
 * Central Axios instance. Attaches the JWT on every request and
 * redirects to /login on 401 so an expired session never gets stuck.
 */
import axios from 'axios'

// In local dev, '/api' is proxied to localhost:8000 by vite.config.js.
// In production (e.g. deployed on Vercel), there's no dev-server proxy, so
// VITE_API_URL must point directly at the deployed backend, e.g.
// https://your-app.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexops_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexops_token')
      localStorage.removeItem('nexops_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/** Extracts a human-readable error message from any Axios/FastAPI error shape. */
export function extractErrorMessage(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  const errors = error?.response?.data?.errors
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((e) => `${e.field ? e.field + ': ' : ''}${e.message}`).join(', ')
  }
  return 'Something went wrong. Please try again.'
}

export default api

/**
 * Resolves a stored upload path (e.g. "uploads/photos/abc.jpg") to a URL the
 * browser can actually load. In dev, '/uploads' is proxied to the backend
 * by vite.config.js. In production there's no proxy, so this strips '/api'
 * off VITE_API_URL to get the backend's origin instead.
 */
export function resolveUploadUrl(storedPath) {
  if (!storedPath) return null
  const relative = storedPath.split('/').slice(1).join('/') // drop leading "uploads" segment convention
  const backendOrigin = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : ''
  return `${backendOrigin}/uploads/${relative}`
}

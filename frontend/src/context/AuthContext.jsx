/**
 * Global authentication state: current user, login/logout, and a loading
 * flag so protected routes don't flash the login page on refresh.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authService from '../services/authService'
import * as userService from '../services/userService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nexops_token')
    const cachedUser = localStorage.getItem('nexops_user')
    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser))
      // Revalidate in the background in case the role/status changed server-side.
      userService.getMyProfile()
        .then((res) => {
          setUser(res.data)
          localStorage.setItem('nexops_user', JSON.stringify(res.data))
        })
        .catch(() => {
          localStorage.removeItem('nexops_token')
          localStorage.removeItem('nexops_user')
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password)
    const { access_token, user: loggedInUser } = res.data
    localStorage.setItem('nexops_token', access_token)
    localStorage.setItem('nexops_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('nexops_token')
    localStorage.removeItem('nexops_user')
    setUser(null)
  }, [])

  const updateUserInContext = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('nexops_user', JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

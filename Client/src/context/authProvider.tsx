import { useState,useEffect } from "react"
import { type AuthUser } from "@/types/user"
import {AuthContext,STORAGE_KEY} from "./authContext"
import { api } from "@/api"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  // Cek apakah ada sesi login tersimpan di localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY)
      const token = localStorage.getItem('token')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
       if (token) {
        // Decode payload JWT secara mandiri tanpa library luar
        const base64Url = token.split('.')[1]
        if (base64Url) {
          const payload = JSON.parse(atob(base64Url))
          const currentTime = Math.floor(Date.now() / 1000)
          // Jika waktu sekarang sudah melewati waktu exp token
          if (payload.exp && payload.exp < currentTime) {
            console.warn('JWT telah kedaluwarsa.')
            localStorage.removeItem('token')
            localStorage.removeItem(STORAGE_KEY)
            setUser(null)
            setIsLoading(false)
            return
          }
        }
      }
      if (savedUser && token) {
        setUser(JSON.parse(savedUser))
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Gagal membaca sesi user:', error)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])
  // Fungsi Login
  const login = async (email: string, password?: string): Promise<boolean> => {
  try {
    const res = await api.post('/api/auth/login', { email, password })
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
    }
    const userData = res.data.user || {
      id: Date.now(),
      name: email.toLowerCase().includes('admin') ? 'Admin Kasir' : 'Staf Kasir',
      email: email.trim(),
      role: 'ADMIN',
    }
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    return true
  } catch (error) {
    console.error('Login gagal:', error)
    return false
  }
}
  // Fungsi Register
  const register = async (name: string, email: string, password?: string): Promise<boolean> => {
  try {
    await api.post('/api/auth/register', { name, email, password, role: 'STAFF' })
    return true
  } catch (error) {
    console.error('Register gagal:', error)
    return false
  }
}
  // Fungsi Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('token') 
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

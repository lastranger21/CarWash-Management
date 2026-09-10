import { useState,useEffect } from "react"
import { type AuthUser } from "@/types/user"
import {AuthContext,STORAGE_KEY} from "./authContext"


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  // Cek apakah ada sesi login tersimpan di localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY)
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Gagal membaca sesi user:', error)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])
  // Fungsi Login
  const login = async (email: string, _password?: string): Promise<boolean> => {
    try {
      // CATATAN: Nanti di sini Anda bisa memanggil API backend Express:
      // const res = await axios.post('/api/login', { email, password })
      // Simulasi autentikasi berhasil:
      const loggedInUser: AuthUser = {
        id: Date.now(),
        name: email.toLowerCase().includes('admin') ? 'Admin Kasir' : 'Staf Kasir Pagi',
        email: email.trim(),
        role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'STAFF',
      }
      setUser(loggedInUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
      return true
    } catch (error) {
      console.error('Login gagal:', error)
      return false
    }
  }
  // Fungsi Register
  const register = async (name: string, email: string, _password?: string): Promise<boolean> => {
    try {
      // CATATAN: Nanti di sini panggil API backend:
      // const res = await axios.post('/api/register', { name, email, password })
      const newUser: AuthUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        role: 'STAFF',
      }
      setUser(newUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
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

import { createContext } from "react";
import {type AuthUser } from "@/types/user";
export interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password?: string) => Promise<boolean>
  register: (name: string, email: string, password?: string) => Promise<boolean>
  logout: () => void
}
export const AuthContext = createContext<AuthContextType |undefined>(undefined) 
export const STORAGE_KEY = 'carwash_auth_user'
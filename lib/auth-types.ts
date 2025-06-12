export type UserRole = "admin" | "user"

export interface User {
  id: string
  username: string
  password: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading?: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterUserData {
  username: string
  password: string
  name: string
  email: string
  role: UserRole
}

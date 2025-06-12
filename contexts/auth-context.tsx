"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

// Definirea tipurilor pentru utilizatori și autentificare
export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  name: string
  email: string
  createdAt: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterUserData {
  username: string
  password: string
  role: "admin" | "user"
  name: string
  email: string
}

// Interfața pentru contextul de autentificare
interface AuthContextType {
  authState: AuthState
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>
  logout: () => void
  register: (userData: RegisterUserData) => Promise<{ success: boolean; message: string }>
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>
  isAdmin: () => boolean
  isAuthenticated: () => boolean // Redenumit din canControlDevices
  getUsers: () => User[]
}

// Crearea contextului
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Date inițiale pentru utilizatori
const initialUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123", // În producție, ar trebui să fie hash-ul parolei
    role: "admin",
    name: "Administrator",
    email: "admin@example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "user",
    password: "user123", // În producție, ar trebui să fie hash-ul parolei
    role: "user",
    name: "Utilizator Normal",
    email: "user@example.com",
    createdAt: new Date().toISOString(),
  },
]

// Provider pentru contextul de autentificare
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Starea de autentificare
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  })

  // Încărcarea utilizatorilor din localStorage
  const [users, setUsers] = useState<User[]>(initialUsers)

  // Verificarea sesiunii la încărcarea paginii
  useEffect(() => {
    const checkSession = () => {
      const storedUsers = localStorage.getItem("users")
      if (!storedUsers) {
        localStorage.setItem("users", JSON.stringify(initialUsers))
        setUsers(initialUsers)
      } else {
        try {
          setUsers(JSON.parse(storedUsers))
        } catch (error) {
          console.error("Error parsing stored users:", error)
          setUsers(initialUsers)
          localStorage.setItem("users", JSON.stringify(initialUsers))
        }
      }

      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        try {
          setAuthState({
            isAuthenticated: true,
            user: JSON.parse(storedUser),
            loading: false,
          })
        } catch (error) {
          console.error("Error parsing stored user:", error)
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
          })
          localStorage.removeItem("currentUser")
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        })
      }
    }

    checkSession()
  }, [])

  // Redirecționarea utilizatorilor neautentificați
  useEffect(() => {
    if (!authState.loading) {
      const publicPaths = ["/login"]

      if (!authState.isAuthenticated && !publicPaths.includes(pathname)) {
        router.push("/login")
      }

      if (authState.isAuthenticated && pathname === "/login") {
        router.push("/")
      }
    }
  }, [authState.isAuthenticated, authState.loading, pathname, router])

  // Funcția de login
  const login = async (credentials: LoginCredentials) => {
    const { username, password } = credentials

    // Căutarea utilizatorului
    const user = users.find((u) => u.username === username && u.password === password)

    if (user) {
      // Salvarea sesiunii
      localStorage.setItem("currentUser", JSON.stringify(user))

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      })

      return { success: true, message: "Autentificare reușită!" }
    }

    return { success: false, message: "Nume de utilizator sau parolă incorecte." }
  }

  // Funcția de logout
  const logout = () => {
    localStorage.removeItem("currentUser")

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    })

    router.push("/login")
  }

  // Funcția de înregistrare (doar pentru admin)
  const register = async (userData: RegisterUserData) => {
    // Verificare dacă utilizatorul curent este admin
    if (!isAdmin()) {
      return { success: false, message: "Nu aveți permisiunea de a crea utilizatori noi." }
    }

    // Verificare dacă numele de utilizator există deja
    if (users.some((u) => u.username === userData.username)) {
      return { success: false, message: "Numele de utilizator există deja." }
    }

    // Crearea noului utilizator
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      password: userData.password,
      role: userData.role,
      name: userData.name,
      email: userData.email,
      createdAt: new Date().toISOString(),
    }

    // Actualizarea listei de utilizatori
    const updatedUsers = [...users, newUser]
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)

    return { success: true, message: "Utilizator creat cu succes!" }
  }

  // Funcția de ștergere utilizator (doar pentru admin)
  const deleteUser = async (userId: string) => {
    // Verificare dacă utilizatorul curent este admin
    if (!isAdmin()) {
      return { success: false, message: "Nu aveți permisiunea de a șterge utilizatori." }
    }

    // Nu permite ștergerea propriului cont
    if (authState.user?.id === userId) {
      return { success: false, message: "Nu vă puteți șterge propriul cont." }
    }

    // Filtrează utilizatorul din listă
    const updatedUsers = users.filter((u) => u.id !== userId)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)

    return { success: true, message: "Utilizator șters cu succes!" }
  }

  // Verificare dacă utilizatorul este admin
  const isAdmin = () => {
    return authState.user?.role === "admin"
  }

  // Verificare dacă utilizatorul este autentificat (redenumit din canControlDevices)
  const isAuthenticated = () => {
    return authState.isAuthenticated
  }

  // Obținerea listei de utilizatori - returnăm o copie nouă a array-ului
  const getUsers = () => {
    // Citim direct din localStorage pentru a ne asigura că avem cele mai recente date
    try {
      const storedUsers = localStorage.getItem("users")
      if (storedUsers) {
        return JSON.parse(storedUsers)
      }
    } catch (error) {
      console.error("Error reading users from localStorage:", error)
    }
    return [...users]
  }

  // Valoarea contextului
  const value = {
    authState,
    login,
    logout,
    register,
    deleteUser,
    isAdmin,
    isAuthenticated,
    getUsers,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook pentru utilizarea contextului de autentificare
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useCustomToast } from "@/components/toast-provider"
import { UserPlus, Users, Shield, User, Trash2 } from "lucide-react"

export default function UsersPage() {
  const { authState, isAdmin, register, deleteUser, getUsers } = useAuth()
  const router = useRouter()
  const { showToast } = useCustomToast()

  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "user",
  })

  // Adăugăm un contor pentru a forța reîncărcarea listei
  const [updateCounter, setUpdateCounter] = useState(0)

  // Verificăm dacă utilizatorul este admin și încărcăm lista de utilizatori
  useEffect(() => {
    if (!authState.loading && !isAdmin()) {
      router.push("/")
    } else {
      // Încărcăm lista de utilizatori
      setUsers(getUsers())
    }
  }, [authState.loading, isAdmin, router, getUsers, updateCounter])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const result = await register(formData)

      if (result.success) {
        showToast({
          title: "Succes",
          description: "Utilizatorul a fost creat cu succes",
          variant: "success",
        })

        // Resetăm formularul
        setFormData({
          username: "",
          password: "",
          name: "",
          email: "",
          role: "user",
        })
        setShowForm(false)

        // Forțăm reîncărcarea listei de utilizatori
        setUpdateCounter((prev) => prev + 1)
      } else {
        showToast({
          title: "Eroare",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      showToast({
        title: "Eroare",
        description: "A apărut o eroare la crearea utilizatorului",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    try {
      const result = await deleteUser(userId)

      if (result.success) {
        showToast({
          title: "Succes",
          description: result.message,
          variant: "success",
        })
        setUpdateCounter((prev) => prev + 1)
      } else {
        showToast({
          title: "Eroare",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      showToast({
        title: "Eroare",
        description: "A apărut o eroare la ștergerea utilizatorului",
        variant: "destructive",
      })
    }
  }

  if (authState.loading) {
    return <div className="text-center">Se încarcă...</div>
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col items-start gap-4">
        <h1 className="text-3xl font-bold">Administrare Utilizatori</h1>

        {/* BUTON PENTRU ADĂUGAREA UTILIZATORILOR */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95"
        >
          <span className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
          <UserPlus size={16} className="transition-transform duration-300 group-hover:scale-110" />
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            {showForm ? "Ascunde formularul" : "Adaugă Utilizator"}
          </span>
        </button>
      </div>

      {/* Formular pentru adăugarea utilizatorilor */}
      {showForm && (
        <div className="mb-8 overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-lg transition-all duration-300 dark:border-indigo-900 dark:bg-gray-800">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <h2 className="text-xl font-bold">Adaugă utilizator nou</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">Nume utilizator</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2.5 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Parolă</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2.5 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Nume complet</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2.5 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2.5 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2.5 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="user">Utilizator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Anulează
              </button>

              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm text-white shadow-md transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95"
              >
                Salvează Utilizator
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de utilizatori */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center border-b p-4 dark:border-gray-700">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Users className="h-5 w-5" />
            Lista utilizatorilor
          </h2>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left dark:border-gray-700">
                  <th className="p-3 font-semibold">Nume utilizator</th>
                  <th className="p-3 font-semibold">Nume complet</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Rol</th>
                  <th className="p-3 font-semibold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Nu există utilizatori. Adaugă primul utilizator folosind butonul de mai sus.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                      <td className="p-3">{user.username}</td>
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <>
                              <Shield className="mr-1 h-3 w-3" />
                              Administrator
                            </>
                          ) : (
                            <>
                              <User className="mr-1 h-3 w-3" />
                              Utilizator
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.id !== authState.user?.id && (
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="inline-flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                            Șterge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { BarChart3, Home, LightbulbIcon, Zap, Menu, X, Settings, Users, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isAdmin, authState } = useAuth()

  // Meniul de bază disponibil pentru toți utilizatorii
  const baseMenuItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      href: "/",
    },
    {
      title: "Rooms",
      icon: Home,
      href: "/rooms",
    },
    {
      title: "Devices",
      icon: LightbulbIcon,
      href: "/devices",
    },
    {
      title: "Moduri",
      icon: Settings,
      href: "/modes",
    },
    {
      title: "Analiză Cost",
      icon: Calculator,
      href: "/cost-analysis",
    },
  ]

  // Adăugăm elementele de meniu pentru admin
  const adminMenuItems = [
    {
      title: "Utilizatori",
      icon: Users,
      href: "/users",
    },
  ]

  // Combinăm meniurile în funcție de rol
  const menuItems = isAdmin() ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems

  // Închide meniul când se schimbă ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Previne scroll-ul pe body când meniul este deschis
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  // Nu afișăm meniul dacă utilizatorul nu este autentificat
  if (!authState.isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Buton pentru deschiderea meniului mobil - vizibil doar când meniul este închis */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-50 md:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Meniul mobil */}
      <div
        className={`
          fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Overlay pentru închidere */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
            isOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
          onClick={() => setIsOpen(false)}
        />

        {/* Conținutul meniului */}
        <div className="absolute top-0 left-0 h-full w-64 bg-background shadow-xl">
          {/* Header meniu cu buton de închidere separat */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="font-semibold">Smart Home IoT</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Elemente meniu */}
          <nav className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Menu</p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
                      ${pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

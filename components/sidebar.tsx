"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, LightbulbIcon, Zap, Settings, Users, Calculator } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isAdmin, authState } = useAuth()

  // Detectăm dacă suntem pe un dispozitiv mobil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px este breakpoint-ul pentru dispozitive mobile
    }

    // Verificăm la încărcarea inițială
    checkIfMobile()

    // Adăugăm un listener pentru redimensionarea ferestrei
    window.addEventListener("resize", checkIfMobile)

    // Curățăm listener-ul la demontarea componentei
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

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

  // Închide meniul mobil când se schimbă ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Nu afișăm sidebar-ul dacă utilizatorul nu este autentificat
  if (!authState.isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen w-64 border-r bg-background">
      <Sidebar>
        <SidebarHeader className="flex items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="font-semibold">Smart Home IoT</div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </div>
  )
}

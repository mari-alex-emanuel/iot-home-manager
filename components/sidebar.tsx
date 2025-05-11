"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, LightbulbIcon, Zap, Menu, X, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

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

  const menuItems = [
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
  ]

  // Închide meniul mobil când se schimbă ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* Buton pentru meniul mobil - afișat doar pe dispozitive mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}

      {/* Sidebar-ul principal - vizibil pe desktop sau când este deschis pe mobil */}
      <div
        className={`
          ${isMobile ? "fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out" : ""}
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          ${isMobile && isMobileMenuOpen ? "bg-background/80 backdrop-blur-sm" : ""}
        `}
      >
        <Sidebar className={`${isMobile ? "w-64 max-w-[80%] h-full" : ""}`}>
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

      {/* Overlay pentru a închide meniul când se face clic în afara lui - doar pe mobil */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}

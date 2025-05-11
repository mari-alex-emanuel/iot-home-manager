import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/sidebar"
import { MobileMenu } from "@/components/mobile-menu"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SmartHomeProvider } from "@/contexts/smart-home-context"
// Importăm noul provider de notificări
import { ToastProvider } from "@/components/toast-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Home IoT Manager",
  description: "Manage your smart home devices and monitor energy consumption",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SmartHomeProvider>
          <SidebarProvider>
            <ToastProvider>
              <div className="flex min-h-screen w-full">
                {/* Desktop Sidebar - ascuns pe mobil */}
                <div className="hidden md:block">
                  <AppSidebar />
                </div>

                {/* Meniu Mobil - vizibil doar pe mobil */}
                <MobileMenu />

                <main className="flex-1 overflow-x-hidden pt-16 md:pt-0">{children}</main>
              </div>
            </ToastProvider>
          </SidebarProvider>
        </SmartHomeProvider>
      </body>
    </html>
  )
}

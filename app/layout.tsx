import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/sidebar"
import { MobileMenu } from "@/components/mobile-menu"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SmartHomeProvider } from "@/contexts/smart-home-context"
import { ToastProvider } from "@/components/toast-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { UserHeader } from "@/components/user-header"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ToastProvider>
            <AuthProvider>
              <SmartHomeProvider>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    {/* Desktop Sidebar - ascuns pe mobil */}
                    <div className="hidden md:block">
                      <AppSidebar />
                    </div>

                    {/* Meniu Mobil - vizibil doar pe mobil */}
                    <MobileMenu />

                    <main className="flex-1 overflow-x-hidden">
                      {/* Header cu informații utilizator și toggle temă */}
                      <div className="sticky top-0 z-10 flex h-16 w-full items-center justify-end border-b bg-background px-4 md:px-6">
                        <div className="flex items-center gap-4">
                          <ThemeToggle />
                          <UserHeader />
                        </div>
                      </div>

                      {/* Conținutul paginii */}
                      <div className="p-4 md:p-6">{children}</div>
                    </main>
                  </div>
                </SidebarProvider>
              </SmartHomeProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

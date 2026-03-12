"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  const handleCollapse = useCallback((val: boolean) => setCollapsed(val), [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onCollapsedChange={handleCollapse} />
      <main className={cn("min-h-screen transition-all duration-300 pt-16 lg:pt-0", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        {children}
      </main>
    </div>
  )
}

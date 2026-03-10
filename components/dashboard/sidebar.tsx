"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Home, Calendar, Users, FileHeart, MessageCircle, DollarSign, Settings, ChevronLeft, LogOut, HelpCircle } from "lucide-react"

const navigation = [
  { name: "Início",       href: "/dashboard",               icon: Home },
  { name: "Agenda",       href: "/dashboard/agenda",         icon: Calendar },
  { name: "Pacientes",    href: "/dashboard/pacientes",      icon: Users },
  { name: "Prontuários",  href: "/dashboard/prontuarios",    icon: FileHeart },
  { name: "WhatsApp",     href: "/dashboard/whatsapp",       icon: MessageCircle },
  { name: "Financeiro",   href: "/dashboard/financeiro",     icon: DollarSign },
]
const secondaryNavigation = [
  { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
  { name: "Ajuda",          href: "/dashboard/ajuda",         icon: HelpCircle },
]

interface SidebarProps { onCollapsedChange?: (val: boolean) => void }

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState<{ nome: string; tenants?: { nome_clinica: string } } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("nome, tenants(nome_clinica)").eq("id", user.id).single()
      if (data) setProfile(data as any)
    }
    loadProfile()
  }, [])

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    onCollapsedChange?.(next)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = profile?.nome
    ? profile.nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <aside className={cn("fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#0A2540] transition-all duration-300", collapsed ? "w-20" : "w-64")}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00C9A7]">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#0A2540]" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8 2 6 6 6 10c0 3 1 5 2 7s2 5 4 5 3-3 4-5 2-4 2-7c0-4-2-8-6-8z" />
            </svg>
          </div>
          {!collapsed && <span className="font-display text-lg font-bold text-white">DentistOS</span>}
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleCollapse}
          className="text-white/60 hover:bg-white/10 hover:text-white">
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-[#00C9A7] text-[#0A2540]" : "text-white/70 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-2")}>
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Secondary */}
      <div className="border-t border-white/10 p-3">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70",
                collapsed && "justify-center px-2")}>
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </div>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className={cn("flex items-center gap-3 rounded-lg p-2", collapsed && "justify-center")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/20 font-semibold text-[#00C9A7]">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-medium text-white">{profile?.nome || "..."}</div>
              <div className="truncate text-xs text-white/50">{(profile as any)?.tenants?.nome_clinica || "..."}</div>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" onClick={handleLogout}
              className="shrink-0 text-white/50 hover:bg-white/10 hover:text-white" title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}

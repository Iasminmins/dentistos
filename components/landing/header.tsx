"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#problema", label: "O Problema" },
    { href: "#solucao", label: "Como Funciona" },
    { href: "#features", label: "Recursos" },
    { href: "#precos", label: "Preços" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0A2540]/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00C9A7]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-[#0A2540]"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2C8 2 6 6 6 10c0 3 1 5 2 7s2 5 4 5 3-3 4-5 2-4 2-7c0-4-2-8-6-8z" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white">
              DentistOS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90">
                Começar grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white lg:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-[#0A2540] lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full text-white hover:bg-white/10 hover:text-white"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90">
                    Começar grátis
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

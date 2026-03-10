import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Syne } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
})

const syne = Syne({ 
  subsets: ["latin"],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DentistOS - Sua clínica no piloto automático',
  description: 'Sistema completo de gestão para dentistas. Agenda inteligente, WhatsApp automático, prontuário digital e muito mais.',
  keywords: ['dentista', 'gestão odontológica', 'agenda dentista', 'software odontológico', 'prontuário odontológico'],
  authors: [{ name: 'DentistOS' }],
  openGraph: {
    title: 'DentistOS - Sua clínica no piloto automático',
    description: 'Sistema completo de gestão para dentistas. Agenda inteligente, WhatsApp automático, prontuário digital e muito mais.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A2540',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body suppressHydrationWarning className={`${plusJakarta.variable} ${syne.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cria cliente Supabase para uso em Server Components e Server Actions
 * Sempre crie um novo cliente dentro de cada função
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Ignora erros quando chamado de Server Component
            // O middleware atualiza a sessão
          }
        },
      },
    },
  )
}

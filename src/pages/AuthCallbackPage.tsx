import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const url = new URL(window.location.href)
    const hasOAuth = url.hash || url.searchParams.get('code') || url.searchParams.get('error')

    if (!hasOAuth) {
      navigate('/', { replace: true })
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        const { data: existing } = await supabase.from('users').select('id').eq('id', session.user.id).maybeSingle()

        if (!existing) {
          await supabase.from('users').insert({
            id: session.user.id,
            display_name: session.user.user_metadata?.full_name || session.user.email || 'User',
            avatar_url: session.user.user_metadata?.avatar_url || null,
          }).select('*').single()
        }

        navigate('/', { replace: true })
      }
    })

    const timeout = setTimeout(() => navigate('/auth', { replace: true }), 15000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <p className="text-gray-500">Авторизация...</p>
    </div>
  )
}

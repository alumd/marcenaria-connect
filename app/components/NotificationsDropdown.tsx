'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Bell, Check, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  link?: string
  created_at: string
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      carregarNotificacoes(user.id)
      
      // Subscribe para notificações em tempo real
      const channel = supabase
        .channel(`notificacoes:${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setNotificacoes(prev => [payload.new as Notificacao, ...prev])
          setNaoLidas(prev => prev + 1)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }

  async function carregarNotificacoes(userId: string) {
    const { data } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotificacoes(data)
      setNaoLidas(data.filter(n => !n.lida).length)
    }
  }

  async function marcarComoLida(id: string) {
    await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id)
    
    setNotificacoes(prev => prev.map(n => 
      n.id === id ? { ...n, lida: true } : n
    ))
    setNaoLidas(prev => Math.max(0, prev - 1))
  }

  async function marcarTodasComoLidas() {
    if (!user) return
    
    await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', user.id)
      .eq('lida', false)
    
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    setNaoLidas(0)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100"
      >
        <Bell className="w-5 h-5" />
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900">Notificações</h3>
              {naoLidas > 0 && (
                <button 
                  onClick={marcarTodasComoLidas}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                  <p className="text-sm">Nenhuma notificação ainda</p>
                </div>
              ) : (
                notificacoes.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${!notif.lida ? 'bg-amber-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.lida ? 'bg-amber-500' : 'bg-zinc-300'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-zinc-900">{notif.titulo}</p>
                        <p className="text-xs text-zinc-600 mt-1">{notif.mensagem}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-zinc-400">
                            {new Date(notif.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="flex gap-2">
                            {notif.link && (
                              <Link 
                                href={notif.link}
                                onClick={() => marcarComoLida(notif.id)}
                                className="text-xs text-amber-600 hover:underline font-medium"
                              >
                                Ver
                              </Link>
                            )}
                            {!notif.lida && (
                              <button 
                                onClick={() => marcarComoLida(notif.id)}
                                className="text-xs text-zinc-500 hover:text-zinc-700"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Circle, Hammer, MapPin, Star, Phone } from 'lucide-react'
import Link from 'next/link'

interface Profissional {
  id: string
  nome: string
  email: string
  telefone: string
  categoria_id: string
  avatar_url?: string
  cidade?: string
  avaliacao?: number
  is_online?: boolean
  ultimo_acesso?: string
  categorias?: {
    nome: string
  }
}

export default function ProfessionalsList({ categoriaSlug }: { categoriaSlug?: string }) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfissionais()
    
    // Subscrição realtime para status online
    const channel = supabase.channel('professionals_online')
      .on('presence', { event: 'sync' }, () => {
        fetchProfissionais()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [categoriaSlug])

  async function fetchProfissionais() {
    let query = supabase
      .from('profissionais')
      .select('*, categorias(nome)')
      .eq('ativo', true)
    
    if (categoriaSlug) {
      query = query.eq('categoria_slug', categoriaSlug)
    }

    const { data, error } = await query
    
    if (data) {
      // Simula status online (último acesso < 5 minutos)
      const profissionaisComStatus = data.map((prof: Profissional) => ({
        ...prof,
        is_online: prof.ultimo_acesso ? 
          new Date().getTime() - new Date(prof.ultimo_acesso).getTime() < 300000 
          : false
      }))
      setProfissionais(profissionaisComStatus)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="h-20 bg-zinc-200 rounded-full w-20 mx-auto mb-4" />
            <div className="h-4 bg-zinc-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-3 bg-zinc-200 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profissionais.map((prof) => (
        <Link
          key={prof.id}
          href={`/profissional/${prof.id}`}
          className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-zinc-100"
        >
          {/* Header com Status */}
          <div className="relative h-24 bg-gradient-to-r from-amber-600 to-amber-700">
            <div className="absolute -bottom-10 left-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                  {prof.avatar_url ? (
                    <img 
                      src={prof.avatar_url} 
                      alt={prof.nome}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center">
                      <Hammer className="w-8 h-8 text-zinc-400" />
                    </div>
                  )}
                </div>
                {/* Badge Online/Offline */}
                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
                  prof.is_online ? 'bg-green-500' : 'bg-zinc-400'
                }`}>
                  <Circle className={`w-3 h-3 text-white ${prof.is_online ? 'fill-current' : ''}`} />
                </div>
              </div>
            </div>
            
            {/* Badge de Status */}
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                prof.is_online 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}>
                <Circle className={`w-2 h-2 ${prof.is_online ? 'fill-current text-green-500' : 'text-zinc-400'}`} />
                {prof.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="pt-12 pb-6 px-6">
            <h3 className="text-xl font-bold text-zinc-900 mb-1 group-hover:text-amber-600 transition-colors">
              {prof.nome}
            </h3>
            
            <p className="text-sm text-amber-600 font-medium mb-3">
              {prof.categorias?.nome || 'Marceneiro'}
            </p>

            <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
              {prof.cidade && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{prof.cidade}</span>
                </div>
              )}
              {prof.avaliacao && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>{prof.avaliacao.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Botão de Contato */}
            <div className="flex gap-2">
              <button className="flex-1 bg-zinc-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Contatar
              </button>
              <button className="flex-1 bg-amber-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-amber-700 transition-colors">
                Ver Perfil
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
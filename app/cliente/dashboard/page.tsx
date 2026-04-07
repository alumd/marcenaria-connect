'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import { 
  User, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Settings, 
  Search,
  Star,
  MapPin,
  ArrowRight
} from 'lucide-react'

export default function ClienteDashboard() {
  const [user, setUser] = useState<any>(null)
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      // Busca dados do cliente
      const { data: cliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setUser({ ...user, profile: cliente })

      // Busca solicitações recentes
      const { data: sols } = await supabase
        .from('solicitacoes')
        .select('*, profissionais(nome, avatar_url)')
        .eq('cliente_id', cliente?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setSolicitacoes(sols || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header da Dashboard */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">
                Olá, {user?.profile?.nome?.split(' ')[0] || 'Cliente'}! 👋
              </h1>
              <p className="text-zinc-600 mt-1">
                Bem-vindo à sua área personalizada
              </p>
            </div>
            <Link 
              href="/#categorias"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-all hover:scale-105 shadow-lg shadow-amber-600/20"
            >
              <Search className="w-5 h-5" />
              Encontrar Profissionais
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Acesso Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Minhas Solicitações</h3>
            <p className="text-2xl font-bold text-zinc-900">{solicitacoes.length}</p>
            <p className="text-sm text-zinc-500 mt-1">Solicitações enviadas</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Conversas</h3>
            <p className="text-2xl font-bold text-zinc-900">0</p>
            <p className="text-sm text-zinc-500 mt-1">Mensagens novas</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Favoritos</h3>
            <p className="text-2xl font-bold text-zinc-900">0</p>
            <p className="text-sm text-zinc-500 mt-1">Profissionais salvos</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Avaliações</h3>
            <p className="text-2xl font-bold text-zinc-900">0</p>
            <p className="text-sm text-zinc-500 mt-1">Serviços avaliados</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Solicitações Recentes */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900">Solicitações Recentes</h2>
                <Link href="/cliente/solicitacoes" className="text-amber-600 font-medium hover:underline flex items-center gap-1">
                  Ver todas <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {solicitacoes.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-700 mb-2">Nenhuma solicitação ainda</h3>
                  <p className="text-zinc-500 mb-4">Encontre profissionais e solicite orçamentos</p>
                  <Link 
                    href="/#categorias"
                    className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                  >
                    Explorar Categorias
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {solicitacoes.map((sol) => (
                    <div key={sol.id} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-zinc-900">{sol.profissionais?.nome || 'Profissional'}</h4>
                        <p className="text-sm text-zinc-500">{sol.descricao?.substring(0, 50)}...</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sol.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                        sol.status === 'aceito' ? 'bg-green-100 text-green-700' :
                        'bg-zinc-100 text-zinc-600'
                      }`}>
                        {sol.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profissionais em Destaque */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Profissionais em Destaque</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-zinc-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-zinc-200 rounded-full"></div>
                      <div>
                        <h4 className="font-semibold text-zinc-900">Marceneiro {i}</h4>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">4.{8+i}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-500 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>São Paulo, SP</span>
                    </div>
                    <Link 
                      href={`/profissional/${i}`}
                      className="w-full block text-center bg-zinc-100 text-zinc-700 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Perfil Resumido */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {user?.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-amber-600" />
                )}
              </div>
              <h3 className="font-bold text-zinc-900 text-lg">{user?.profile?.nome}</h3>
              <p className="text-zinc-500 text-sm mb-4">{user?.email}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 mb-4">
                <MapPin className="w-4 h-4" />
                {user?.profile?.cidade || 'Cidade não informada'}
              </div>
              <Link 
                href="/perfil"
                className="inline-flex items-center gap-2 text-amber-600 font-medium hover:underline"
              >
                <Settings className="w-4 h-4" />
                Editar Perfil
              </Link>
            </div>

            {/* Atalhos */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">Atalhos Rápidos</h3>
              <div className="space-y-2">
                <Link href="/#categorias" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors">
                  <Search className="w-5 h-5 text-amber-600" />
                  Buscar Profissionais
                </Link>
                <Link href="/cliente/solicitacoes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Minhas Solicitações
                </Link>
                <Link href="/cliente/mensagens" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Mensagens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
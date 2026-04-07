'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import { 
  Hammer,
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  Users,
  Star,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react'

export default function ProfissionalDashboard() {
  const [user, setUser] = useState<any>(null)
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [stats, setStats] = useState({ pendentes: 0, aceitas: 0, total: 0 })
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

      // Busca dados do profissional
      const { data: prof } = await supabase
        .from('profissionais')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!prof) {
        window.location.href = '/'
        return
      }

      setUser({ ...user, profile: prof })

      // Busca solicitações pendentes
      const { data: sols } = await supabase
        .from('solicitacoes')
        .select('*, clientes(nome)')
        .eq('profissional_id', prof.id)
        .order('created_at', { ascending: false })

      setSolicitacoes(sols || [])
      
      // Calcula estatísticas
      const pendentes = sols?.filter(s => s.status === 'pendente').length || 0
      const aceitas = sols?.filter(s => s.status === 'aceito').length || 0
      setStats({ pendentes, aceitas, total: sols?.length || 0 })

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAceitar(solicitacaoId: string) {
    await supabase
      .from('solicitacoes')
      .update({ status: 'aceito' })
      .eq('id', solicitacaoId)
    loadDashboard()
  }

  async function handleRecusar(solicitacaoId: string) {
    await supabase
      .from('solicitacoes')
      .update({ status: 'recusado' })
      .eq('id', solicitacaoId)
    loadDashboard()
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
      {/* Header */}
      <div className="bg-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Bem-vindo, {user?.profile?.nome?.split(' ')[0]}! 🔨
              </h1>
              <p className="text-amber-100 mt-1">
                Área de trabalho - {user?.profile?.categorias?.nome || 'Marceneiro'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/profissional/agenda"
                className="inline-flex items-center gap-2 bg-white text-amber-600 px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-all"
              >
                <Calendar className="w-5 h-5" />
                Minha Agenda
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Pendentes</h3>
            <p className="text-3xl font-bold text-zinc-900">{stats.pendentes}</p>
            <p className="text-sm text-zinc-500 mt-1">Novas solicitações</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Aceitas</h3>
            <p className="text-3xl font-bold text-zinc-900">{stats.aceitas}</p>
            <p className="text-sm text-zinc-500 mt-1">Em andamento</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Total Clientes</h3>
            <p className="text-3xl font-bold text-zinc-900">{stats.total}</p>
            <p className="text-sm text-zinc-500 mt-1">Solicitações recebidas</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Avaliação</h3>
            <p className="text-3xl font-bold text-zinc-900">4.8</p>
            <p className="text-sm text-zinc-500 mt-1">Média dos clientes</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Solicitações Pendentes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900">Novas Solicitações</h2>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.pendentes} novas
                </span>
              </div>

              {solicitacoes.filter(s => s.status === 'pendente').length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-700">Tudo em ordem!</h3>
                  <p className="text-zinc-500">Nenhuma solicitação pendente no momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {solicitacoes
                    .filter(s => s.status === 'pendente')
                    .map((sol) => (
                    <div key={sol.id} className="border border-zinc-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-900">{sol.clientes?.nome || 'Cliente'}</h4>
                            <p className="text-sm text-zinc-500">
                              {new Date(sol.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                          Pendente
                        </span>
                      </div>
                      
                      <p className="text-zinc-600 text-sm mb-4 line-clamp-2">
                        {sol.descricao}
                      </p>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAceitar(sol.id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Aceitar
                        </button>
                        <button 
                          onClick={() => handleRecusar(sol.id)}
                          className="flex-1 bg-zinc-100 text-zinc-700 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status da Conta */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">Status da Conta</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 text-sm">Perfil</span>
                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Completo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 text-sm">Disponibilidade</span>
                  <span className="text-green-600 text-sm font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 text-sm">Avaliações</span>
                  <span className="text-zinc-900 text-sm font-medium">12 reviews</span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Link href="/profissional/agenda" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Gerenciar Agenda
                </Link>
                <Link href="/profissional/servicos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors">
                  <Hammer className="w-5 h-5 text-blue-600" />
                  Meus Serviços
                </Link>
                <Link href="/profissional/mensagens" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Mensagens
                </Link>
                <Link href="/profissional/configuracoes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors">
                  <Settings className="w-5 h-5 text-zinc-600" />
                  Configurações
                </Link>
              </div>
            </div>

            {/* Dica */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <h4 className="font-semibold text-amber-900 mb-2">💡 Dica do dia</h4>
              <p className="text-sm text-amber-800">
                Mantenha sua agenda sempre atualizada para receber mais solicitações de clientes!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { User, Camera, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cidade: '',
    bio: ''
  })

  useEffect(() => {
    carregarPerfil()
  }, [])

  async function carregarPerfil() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    // Tenta buscar em profissionais ou clientes
    const { data: prof } = await supabase
      .from('profissionais')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const profile = prof || cliente
    
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        telefone: profile.telefone || '',
        cidade: profile.cidade || '',
        bio: profile.bio || ''
      })
    }

    setUser({ ...user, tipo: prof ? 'profissional' : 'cliente', profile })
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const tabela = user.tipo === 'profissional' ? 'profissionais' : 'clientes'
    
    const { error } = await supabase
      .from(tabela)
      .update({
        nome: formData.nome,
        telefone: formData.telefone,
        cidade: formData.cidade,
        bio: formData.bio
      })
      .eq('user_id', user.id)

    if (!error) {
      alert('Perfil atualizado com sucesso!')
    } else {
      alert('Erro ao salvar: ' + error.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={user?.tipo === 'profissional' ? '/profissional/dashboard' : '/cliente/dashboard'} 
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <User className="w-12 h-12 text-amber-600" />
              <button className="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">{formData.nome || 'Seu Nome'}</h1>
            <p className="text-zinc-500 capitalize">{user?.tipo}</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Nome Completo</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Cidade</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Bio/Descrição</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Alterações</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
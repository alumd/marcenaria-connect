'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { User, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CadastroCliente() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    senha: '',
    confirmar_senha: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (formData.senha !== formData.confirmar_senha) {
      alert('As senhas não coincidem!')
      return
    }

    setLoading(true)

    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Inserir na tabela clientes
        const { error: insertError } = await supabase
          .from('clientes')
          .insert({
            id: authData.user.id,
            user_id: authData.user.id,
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            cidade: formData.cidade,
            created_at: new Date().toISOString()
          })

        if (insertError) throw insertError
        
        setSuccess(true)
      }
    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Bem-vindo!</h2>
          <p className="text-zinc-600 mb-6">
            Seu cadastro foi realizado com sucesso. Confirme seu e-mail para começar.
          </p>
          <Link
            href="/"
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Explorar Serviços
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 p-3 rounded-xl">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Criar Conta</h1>
              <p className="text-zinc-600">Encontre os melhores profissionais</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                placeholder="Maria Oliveira"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">E-mail</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                placeholder="maria@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Cidade</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="São Paulo, SP"
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.confirmar_senha}
                  onChange={(e) => setFormData({...formData, confirmar_senha: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-4 rounded-lg font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>

            <p className="text-center text-sm text-zinc-600">
              Já tem conta?{' '}
              <Link href="/login" className="text-amber-600 font-medium hover:underline">
                Faça login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
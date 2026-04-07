'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { ArrowLeft, Hammer, User, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tipoUsuario, setTipoUsuario] = useState<'cliente' | 'profissional'>('cliente')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (error) throw error

     // Dentro do try, após o login bem-sucedido:
if (data.user) {
  // Verifica se é profissional
  const { data: profData } = await supabase
    .from('profissionais')
    .select('id')
    .eq('user_id', data.user.id)
    .single()

  if (profData) {
    router.push('/profissional/dashboard')
  } else {
    router.push('/cliente/dashboard')
  }
}
    } catch (error: any) {
      alert('Erro no login: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        
        {/* Botão Voltar para Home */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Toggle Cliente/Profissional */}
          <div className="flex gap-2 mb-8 p-1 bg-zinc-100 rounded-lg">
            <button
              type="button"
              onClick={() => setTipoUsuario('cliente')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-all ${
                tipoUsuario === 'cliente' 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <User className="w-4 h-4" />
              Sou Cliente
            </button>
            <button
              type="button"
              onClick={() => setTipoUsuario('profissional')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-all ${
                tipoUsuario === 'profissional' 
                  ? 'bg-white text-amber-600 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Hammer className="w-4 h-4" />
              Sou Profissional
            </button>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 mb-2 text-center">
            Bem-vindo de volta
          </h1>
          <p className="text-zinc-600 text-center mb-8">
            {tipoUsuario === 'cliente' 
              ? 'Encontre os melhores marceneiros' 
              : 'Acesse sua área de trabalho'}
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">E-mail</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-600">
                <input type="checkbox" className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500" />
                Lembrar-me
              </label>
              <Link href="/recuperar-senha" className="text-amber-600 hover:underline font-medium">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-semibold transition-all hover:scale-[1.02] ${
                tipoUsuario === 'profissional'
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/20'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Link para Cadastro */}
          <div className="mt-6 text-center">
            <p className="text-zinc-600 text-sm">
              Ainda não tem conta?{' '}
              <Link 
                href={tipoUsuario === 'cliente' ? '/cadastro' : '/cadastro-profissional'}
                className="font-medium text-amber-600 hover:underline"
              >
                Cadastre-se agora
              </Link>
            </p>
          </div>

          {/* Alternar tipo de conta */}
          <div className="mt-4 pt-4 border-t border-zinc-200 text-center">
            <button
              onClick={() => setTipoUsuario(tipoUsuario === 'cliente' ? 'profissional' : 'cliente')}
              className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              {tipoUsuario === 'cliente' 
                ? 'É profissional? Clique aqui' 
                : 'É cliente? Clique aqui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
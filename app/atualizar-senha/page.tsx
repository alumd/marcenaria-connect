'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AtualizarSenha() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [validandoToken, setValidandoToken] = useState(true)

  useEffect(() => {
    // Verifica se veio com token válido na URL
    const hash = window.location.hash
    if (!hash.includes('access_token')) {
      setErro('Link inválido ou expirado. Solicite uma nova recuperação de senha.')
    }
    setValidandoToken(false)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }
    
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha
      })

      if (error) throw error

      setSucesso(true)
      
      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (error: any) {
      setErro(error.message || 'Erro ao atualizar senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (validandoToken) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-zinc-100">
          
          {!sucesso ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Nova Senha</h1>
                <p className="text-zinc-600 text-sm">
                  Digite sua nova senha abaixo.
                </p>
              </div>

              {erro && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{erro}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      required
                      minLength={6}
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
                  <p className="text-xs text-zinc-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmar ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all pr-12"
                      placeholder="••••••••"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showConfirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-all hover:scale-[1.02] shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Atualizando...
                    </span>
                  ) : (
                    'Atualizar senha'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">Senha atualizada! 🔒</h2>
              <p className="text-zinc-600 mb-6">
                Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes...
              </p>
              <div className="w-full bg-zinc-100 rounded-full h-2 mb-6 overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full animate-pulse w-full" />
              </div>
              <Link
                href="/login"
                className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                Ir para o login agora
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      })

      if (error) throw error

      setEnviado(true)
    } catch (error: any) {
      setErro(error.message || 'Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setLoading(false)
    }
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
          
          {!enviado ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Recuperar Senha</h1>
                <p className="text-zinc-600 text-sm">
                  Digite seu e-mail abaixo e enviaremos um link para redefinir sua senha.
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
                    E-mail cadastrado
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-all hover:scale-[1.02] shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar link de recuperação'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">E-mail enviado! 📧</h2>
              <p className="text-zinc-600 mb-6">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Verifique sua caixa de entrada e siga as instruções.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Dica:</strong> O e-mail pode cair na pasta de spam ou lixo eletrônico.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block bg-zinc-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
              >
                Voltar para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
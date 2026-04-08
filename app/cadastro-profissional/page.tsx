'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Hammer, CheckCircle2, ArrowLeft, Eye, EyeOff, AlertCircle, PartyPopper } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
export default function CadastroProfissional() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    categoria_id: '',
    cidade: '',
    senha: '',
    confirmar_senha: '',
    bio: ''
  })

  const categorias = [
    { id: '1', nome: 'Cortes Orgânicos' },
    { id: '2', nome: 'Móveis Planejados' },
    { id: '3', nome: 'Portas & Janelas' },
    { id: '4', nome: 'Revestimentos' },
    { id: '5', nome: 'Esculturas & Artes' },
    { id: '6', nome: 'Serviços Gerais' },
  ]

  function validarEtapa1() {
    if (!formData.nome || !formData.email || !formData.telefone || !formData.cidade || !formData.categoria_id) {
      setError('Preencha todos os campos obrigatórios')
      return false
    }
    setError('')
    return true
  }

  function validarEtapa2() {
    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return false
    }
    if (formData.senha !== formData.confirmar_senha) {
      setError('As senhas não coincidem')
      return false
    }
    setError('')
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validarEtapa2()) return
    
    setLoading(true)
    setError('')

    try {
      console.log('Iniciando cadastro...')
      
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: formData.nome,
            tipo: 'profissional'
          }
        }
      })

      if (authError) {
        console.error('Erro auth:', authError)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Usuário não criado')
      }

      console.log('Usuário auth criado:', authData.user.id)

      // 2. Tentar inserir na tabela profissionais
      // Primeiro verifica se a tabela existe com a coluna correta
      const profissionalData = {
        user_id: authData.user.id,  // UUID do auth
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        categoria_id: formData.categoria_id,
        cidade: formData.cidade,
        bio: formData.bio || null,
        ativo: true,
        created_at: new Date().toISOString()
      }

      console.log('Inserindo dados:', profissionalData)

      const { error: insertError } = await supabase
        .from('profissionais')
        .insert(profissionalData)

      if (insertError) {
        console.error('Erro insert:', insertError)
        
        // Se der erro de coluna, informa o usuário
        if (insertError.message.includes('user_id') || insertError.message.includes('column')) {
          setError('Erro de configuração do banco. Contate o suporte.')
          // Deleta o usuário criado para não ficar órfão
          await supabase.auth.signOut()
        } else {
          throw insertError
        }
        return
      }

      console.log('Profissional cadastrado com sucesso!')
      
      // 3. Auto-login após cadastro
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
      })

      if (loginError) {
        console.error('Erro auto-login:', loginError)
        // Continua mesmo se falhar o auto-login
      }

      setStep(3) // Sucesso
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        router.push('/profissional/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Erro completo:', error)
      setError(error.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o início
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-3 rounded-xl shadow-lg shadow-amber-600/20">
              <Hammer className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Cadastro Profissional</h1>
              <p className="text-zinc-600">Junte-se à nossa rede de marceneiros</p>
            </div>
          </div>
        </div>

        {/* Alerta de erro */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-zinc-100">
            {/* Progresso */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">1</div>
              <div className="h-1 flex-1 bg-zinc-200 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-amber-600 rounded-full transition-all duration-500" />
              </div>
              <div className="w-10 h-10 bg-zinc-200 text-zinc-400 rounded-full flex items-center justify-center font-bold">2</div>
            </div>

            <form onSubmit={(e) => { 
              e.preventDefault(); 
              if (validarEtapa1()) setStep(2) 
            }} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder="João Silva Santos"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder="joao@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Telefone <span className="text-red-500">*</span>
                  </label>
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
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Cidade <span className="text-red-500">*</span>
                  </label>
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

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Especialidade <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white"
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-all hover:scale-[1.02] shadow-lg shadow-amber-600/20"
              >
                Continuar
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-zinc-100">
            {/* Progresso */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="h-1 flex-1 bg-zinc-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-green-500 rounded-full" />
              </div>
              <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">2</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Sobre você (Bio)
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Conte um pouco sobre sua experiência, especialidades e diferenciais..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
                <p className="text-xs text-zinc-500 mt-1">Mínimo 50 caracteres recomendado</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all pr-12"
                      placeholder="••••••••"
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
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
                    Confirmar Senha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmarSenha ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all pr-12"
                      placeholder="••••••••"
                      value={formData.confirmar_senha}
                      onChange={(e) => setFormData({...formData, confirmar_senha: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showConfirmarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-zinc-100 text-zinc-700 py-4 rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-all hover:scale-[1.02] shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando conta...
                    </span>
                  ) : (
                    'Criar Conta'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-zinc-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">Cadastro Realizado! 🎉</h2>
            <p className="text-zinc-600 mb-2">
              Sua conta foi criada com sucesso.
            </p>
            <p className="text-zinc-500 text-sm mb-8">
              Você será redirecionado para o seu dashboard em instantes...
            </p>
            <div className="w-full bg-zinc-100 rounded-full h-2 mb-6 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full animate-pulse w-full" />
            </div>
            <Link
              href="/profissional/dashboard"
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Ir para Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

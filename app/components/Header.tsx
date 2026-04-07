'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { 
  Hammer, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Settings,
  Bell
} from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'cliente' | 'profissional' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUser()
      } else {
        setUser(null)
        setUserType(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Verifica se é profissional
        const { data: prof } = await supabase
          .from('profissionais')
          .select('id, nome, avatar_url')
          .eq('user_id', user.id)
          .single()
        
        if (prof) {
          setUserType('profissional')
          setUser({ ...user, profile: prof })
        } else {
          // Verifica se é cliente
          const { data: cliente } = await supabase
            .from('clientes')
            .select('id, nome, avatar_url')
            .eq('user_id', user.id)
            .single()
          
          if (cliente) {
            setUserType('cliente')
            setUser({ ...user, profile: cliente })
          }
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-amber-600 p-2 rounded-lg group-hover:bg-amber-700 transition-colors">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-zinc-900">Marcenaria Connect</span>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-zinc-600 hover:text-amber-600 font-medium transition-colors">
              Início
            </Link>
            <Link href="/#categorias" className="text-zinc-600 hover:text-amber-600 font-medium transition-colors">
              Categorias
            </Link>
            
            {!user && (
              <>
                <Link href="/cadastro" className="text-zinc-600 hover:text-amber-600 font-medium transition-colors">
                  Sou Cliente
                </Link>
                <Link href="/cadastro-profissional" className="text-zinc-600 hover:text-amber-600 font-medium transition-colors">
                  Sou Profissional
                </Link>
              </>
            )}
          </nav>

          {/* Área do Usuário */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    {/* Notificações */}
                    <button className="relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors">
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Menu do Usuário */}
                    <div className="relative group">
                      <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 transition-colors">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          {user.profile?.avatar_url ? (
                            <img src={user.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <span className="font-medium text-zinc-700 max-w-[120px] truncate">
                          {user.profile?.nome || user.email}
                        </span>
                      </button>

                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                        <div className="p-4 border-b border-zinc-100">
                          <p className="font-semibold text-zinc-900">{user.profile?.nome || 'Usuário'}</p>
                          <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                          <span className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                            userType === 'profissional' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {userType === 'profissional' ? '🔨 Profissional' : '👤 Cliente'}
                          </span>
                        </div>
                        
                        <div className="p-2">
                          <Link 
                            href={userType === 'profissional' ? '/profissional/dashboard' : '/cliente/dashboard'}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Meu Dashboard
                          </Link>
                          
                          <Link 
                            href="/perfil"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Configurações
                          </Link>
                          
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors mt-2 border-t border-zinc-100 pt-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Sair
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link 
                      href="/login"
                      className="text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
                    >
                      Entrar
                    </Link>
                    <Link 
                      href="/cadastro"
                      className="bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-all hover:scale-105 shadow-lg shadow-amber-600/20"
                    >
                      Criar Conta
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Menu Mobile */}
          <button 
            className="md:hidden p-2 text-zinc-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200 py-4 px-4 space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">{user.profile?.nome || 'Usuário'}</p>
                  <p className="text-xs text-zinc-500">{userType === 'profissional' ? 'Profissional' : 'Cliente'}</p>
                </div>
              </div>
              
              <Link 
                href={userType === 'profissional' ? '/profissional/dashboard' : '/cliente/dashboard'}
                className="flex items-center gap-2 py-2 text-zinc-600"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              
              <button 
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 py-2 text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="block py-2 text-zinc-600" onClick={() => setMenuOpen(false)}>Início</Link>
              <Link href="/login" className="block py-2 text-zinc-600" onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link href="/cadastro" className="block w-full text-center bg-amber-600 text-white py-3 rounded-lg" onClick={() => setMenuOpen(false)}>
                Criar Conta
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginProfissional() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro('');

    // Buscar profissional pelo email e senha
    const { data: profissional, error } = await supabase
      .from('profissionais')
      .select('*')
      .eq('email_profissional', email)
      .eq('senha', senha)
      .single();

    if (error || !profissional) {
      setErro('Email ou senha incorretos');
      setLoading(false);
      return;
    }

    // Salvar no localStorage (simulando sessão)
    localStorage.setItem('profissional_id', profissional.id);
    localStorage.setItem('profissional_nome', profissional.nome);
    
    router.push('/profissional/dashboard');
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
        <Link href="/" className="flex items-center text-stone-500 hover:text-stone-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para site
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Área do Profissional</h1>
          <p className="text-stone-500 mt-2">Acesse suas solicitações e agenda</p>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-stone-50 rounded-lg text-xs text-stone-500">
          <p className="font-medium mb-1">Dados de teste:</p>
          <p>Email: joao@marcenaria.com</p>
          <p>Senha: 123456</p>
        </div>
      </div>
    </div>
  );
}
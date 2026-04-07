'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, MapPin, Phone, Star, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [categoria, setCategoria] = useState<any>(null);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conexaoStatus, setConexaoStatus] = useState<'conectado' | 'desconectado'>('desconectado');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  useEffect(() => {
    if (!slug) return
    
    carregarDados();

    // Realtime para profissionais desta categoria
    const canal = supabase
      .channel(`categoria_${slug}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profissionais' },
        (payload) => {
          console.log('🔄 Profissional atualizado:', payload);
          carregarDados();
          setUltimaAtualizacao(new Date());
        }
      )
      .subscribe((status) => {
        setConexaoStatus(status === 'SUBSCRIBED' ? 'conectado' : 'desconectado');
      });

    // Atualizar a cada 1 segundo
    const interval = setInterval(() => {
      carregarDados();
      setUltimaAtualizacao(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(canal);
    };
  }, [slug]);

  async function carregarDados() {
    if (!slug) return;

    // Buscar categoria
    const { data: cat } = await supabase
      .from('categorias')
      .select('*')
      .eq('slug', slug)
      .single();

    if (cat) {
      setCategoria(cat);

      // Buscar profissionais
      const { data: profs } = await supabase
        .from('profissionais')
        .select('*')
        .eq('categoria_id', cat.id)
        .eq('ativo', true);

      setProfissionais(profs || []);
    }
    
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Carregando...</div>
      </main>
    );
  }

  if (!categoria) {
    return (
      <main className="min-h-screen bg-stone-50 p-8">
        <div className="container mx-auto">
          <Link href="/" className="text-amber-600 hover:underline mb-4 block">
            ← Voltar para home
          </Link>
          <h1 className="text-2xl font-bold text-stone-800">Categoria não encontrada</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center text-amber-500 hover:text-amber-400">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Link>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700">
              {conexaoStatus === 'conectado' ? (
                <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
              ) : (
                <WifiOff className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-xs text-stone-300">
                {conexaoStatus === 'conectado' ? 'AO VIVO' : 'SINCRONIZANDO'}
              </span>
              <span className="text-xs text-stone-500 border-l border-stone-600 pl-2">
                {ultimaAtualizacao.toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-amber-500">{categoria.nome}</h1>
          <p className="text-stone-400 mt-2">{categoria.descricao}</p>
        </div>
      </header>

      {/* Lista de Profissionais */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-800">
            Profissionais disponíveis ({profissionais.length})
          </h2>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full animate-pulse">
            Atualiza em tempo real
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profissionais.map((prof: any) => (
            <Link 
              key={prof.id} 
              href={`/profissional/${prof.id}`}
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-all hover:border-amber-300 block"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-amber-700">
                    {prof.nome.charAt(0)}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-800">{prof.nome}</h3>
                  
                  <div className="flex items-center gap-1 text-amber-500 mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{prof.anos_experiencia} anos de experiência</span>
                  </div>

                  <p className="text-stone-600 text-sm mt-3 line-clamp-2">
                    {prof.bio}
                  </p>

                  <div className="flex items-center gap-2 text-stone-500 text-sm mt-3">
                    <MapPin className="w-4 h-4" />
                    {prof.cidade}, {prof.estado}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <span className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">
                      <Phone className="w-4 h-4" />
                      Ver perfil
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {profissionais.length === 0 && (
          <div className="text-center py-12 text-stone-500 bg-white rounded-xl border border-stone-200">
            <p>Nenhum profissional encontrado nesta categoria ainda.</p>
          </div>
        )}
      </div>
    </main>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Leaf, Box, Settings, Grid3X3, Armchair, LayoutGrid, Wifi } from 'lucide-react';
import Link from 'next/link';

const iconMap: { [key: string]: any } = {
  Leaf,
  Box,
  Settings,
  Grid3X3,
  Armchair,
  LayoutGrid
};

export default function Home() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [conexaoStatus, setConexaoStatus] = useState<'conectado' | 'desconectado'>('desconectado');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCategorias();

    // Realtime para categorias
    const canal = supabase
      .channel('categorias_public')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categorias' },
        (payload) => {
          console.log('🔄 Categoria atualizada:', payload);
          carregarCategorias();
          setUltimaAtualizacao(new Date());
        }
      )
      .subscribe((status) => {
        setConexaoStatus(status === 'SUBSCRIBED' ? 'conectado' : 'desconectado');
      });

    // Atualizar a cada 1 segundo
    const interval = setInterval(() => {
      carregarCategorias();
      setUltimaAtualizacao(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(canal);
    };
  }, []);

  async function carregarCategorias() {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .eq('ativo', true)
      .order('ordem');
    
    setCategorias(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Carregando...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header com status */}
      <header className="bg-stone-900 text-white py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-500">Marcenaria Connect</h1>
            <p className="text-stone-400 text-sm mt-1">Serviços personalizados de madeira</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700">
            {conexaoStatus === 'conectado' ? (
              <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
            ) : (
              <Wifi className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-xs text-stone-300">
              {conexaoStatus === 'conectado' ? 'AO VIVO' : 'SINCRONIZANDO'}
            </span>
            <span className="text-xs text-stone-500 border-l border-stone-600 pl-2">
              {ultimaAtualizacao.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-stone-800 mb-2">Escolha uma categoria</h2>
            <p className="text-stone-600">Encontre profissionais especializados para seu projeto</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full animate-pulse">
            Atualiza em tempo real
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((cat: any, index: number) => {
            const IconComponent = iconMap[cat.icone] || Box;
            
            return (
              <Link 
                key={cat.id} 
                href={`/categoria/${cat.slug}`}
                className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-stone-200 overflow-hidden hover:border-amber-300"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                    <IconComponent className="w-6 h-6 text-amber-700" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-amber-700 transition-colors">
                    {cat.nome}
                  </h3>
                  
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {cat.descricao}
                  </p>
                  
                  <div className="mt-4 flex items-center text-amber-600 text-sm font-medium">
                    Ver profissionais
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
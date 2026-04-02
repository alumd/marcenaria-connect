'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, Calendar, Clock, Upload, Phone, Mail, 
  FileText, Image as ImageIcon, MessageCircle, 
  CheckCircle, MapPin, Star, Wifi, WifiOff 
} from 'lucide-react';
import Link from 'next/link';

export default function ProfissionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profissional, setProfissional] = useState<any>(null);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conexaoStatus, setConexaoStatus] = useState<'conectado' | 'desconectado'>('desconectado');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());
  
  const [modalAberto, setModalAberto] = useState<'imagem' | 'arquivo' | 'contato' | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
    dataSelecionada: '',
    horaSelecionada: ''
  });
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    carregarDados();

    // Realtime para agenda deste profissional
    const canal = supabase
      .channel(`agenda_public_${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'agenda', filter: `profissional_id=eq.${id}` },
        (payload) => {
          console.log('🔄 Agenda atualizada:', payload);
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
  }, [id]);

  async function carregarDados() {
    if (!id) return;

    const { data: prof } = await supabase
      .from('profissionais')
      .select('*, categorias(nome, slug)')
      .eq('id', id)
      .single();

    const hoje = new Date().toISOString().split('T')[0];
    const { data: agendamentos } = await supabase
      .from('agenda')
      .select('*')
      .eq('profissional_id', id)
      .gte('data', hoje)
      .order('data', { ascending: true })
      .order('hora_inicio', { ascending: true });

    setProfissional(prof);
    setAgenda(agendamentos || []);
    setLoading(false);
  }

  const agendaPorData = agenda.reduce((acc: any, item: any) => {
    if (!acc[item.data]) acc[item.data] = [];
    acc[item.data].push(item);
    return acc;
  }, {});

  async function handleSubmit(tipo: 'preview_imagem' | 'arquivo_tecnico' | 'contato_direto') {
    setEnviando(true);
    
    let imagemUrl = null;
    let arquivoUrl = null;

    if (arquivoSelecionado && tipo === 'preview_imagem') {
      const fileName = `${Date.now()}_${arquivoSelecionado.name}`;
      const { data } = await supabase.storage.from('previews').upload(fileName, arquivoSelecionado);
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('previews').getPublicUrl(data.path);
        imagemUrl = publicUrl;
      }
    }

    if (arquivoSelecionado && tipo === 'arquivo_tecnico') {
      const fileName = `${Date.now()}_${arquivoSelecionado.name}`;
      const { data } = await supabase.storage.from('arquivos').upload(fileName, arquivoSelecionado);
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('arquivos').getPublicUrl(data.path);
        arquivoUrl = publicUrl;
      }
    }

    await supabase.from('solicitacoes').insert({
      profissional_id: id,
      cliente_nome: formData.nome,
      cliente_email: formData.email,
      cliente_telefone: formData.telefone,
      tipo_contato: tipo,
      descricao: formData.descricao,
      data_solicitada: formData.dataSelecionada || null,
      hora_solicitada: formData.horaSelecionada || null,
      imagem_url: imagemUrl,
      arquivo_url: arquivoUrl,
      status: 'pendente'
    });

    setEnviando(false);
    setSucesso(true);
    setTimeout(() => {
      setSucesso(false);
      setModalAberto(null);
      setFormData({ nome: '', email: '', telefone: '', descricao: '', dataSelecionada: '', horaSelecionada: '' });
      setArquivoSelecionado(null);
    }, 3000);
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-stone-600">Carregando...</div>
    </div>
  );
  
  if (!profissional) return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-stone-800">Profissional não encontrado</h1>
        <Link href="/" className="text-amber-600 hover:underline mt-4 block">← Voltar</Link>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="bg-stone-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href={`/categoria/${profissional.categorias?.slug || profissional.categoria_id}`} 
              className="flex items-center text-amber-500 hover:text-amber-400"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para {profissional.categorias?.nome || 'categoria'}
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
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-2xl font-bold text-amber-700">
              {profissional.nome.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profissional.nome}</h1>
              <div className="flex items-center gap-4 mt-1 text-stone-400 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  {profissional.anos_experiencia} anos exp.
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profissional.cidade}, {profissional.estado}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h2 className="text-xl font-bold text-stone-800 mb-4">Sobre o profissional</h2>
              <p className="text-stone-600 leading-relaxed">{profissional.bio}</p>
              <div className="mt-4 flex items-center gap-2 text-stone-500">
                <Phone className="w-4 h-4" />
                {profissional.telefone}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Agenda de Disponibilidade
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full animate-pulse">
                    AO VIVO
                  </span>
                </h2>
                <span className="text-xs text-stone-400">
                  Atualizado: {ultimaAtualizacao.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(agendaPorData).length === 0 ? (
                  <p className="text-stone-500 text-center py-4">Nenhum horário disponível nos próximos dias.</p>
                ) : (
                  Object.entries(agendaPorData).map(([data, horarios]: [string, any]) => (
                    <div key={data} className="border-b border-stone-100 pb-4 last:border-0">
                      <h3 className="font-semibold text-stone-700 mb-2 capitalize">
                        {new Date(data).toLocaleDateString('pt-BR', { 
                          weekday: 'long', day: 'numeric', month: 'long' 
                        })}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {horarios.map((hora: any) => (
                          <div 
                            key={hora.id}
                            className={`p-2 rounded-lg text-center text-sm border ${
                              hora.status === 'disponivel' 
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-pointer' 
                                : 'bg-red-50 text-red-700 border-red-200 opacity-60 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (hora.status === 'disponivel') {
                                setFormData({...formData, dataSelecionada: hora.data, horaSelecionada: hora.hora_inicio});
                              }
                            }}
                          >
                            <Clock className="w-3 h-3 inline mr-1" />
                            {hora.hora_inicio.slice(0,5)}
                            <div className="text-xs mt-1 font-medium">
                              {hora.status === 'disponivel' ? 'Livre' : 'Ocupado'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-800 mb-4">Como deseja prosseguir?</h2>
            
            <button 
              onClick={() => setModalAberto('imagem')}
              className="w-full bg-white p-6 rounded-xl shadow-sm border-2 border-stone-200 hover:border-amber-500 transition-all text-left group hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <ImageIcon className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 group-hover:text-amber-700">Enviar prévia/imagem</h3>
                  <p className="text-sm text-stone-600 mt-1">Envie fotos de referência ou desenhos do que deseja</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setModalAberto('arquivo')}
              className="w-full bg-white p-6 rounded-xl shadow-sm border-2 border-stone-200 hover:border-blue-500 transition-all text-left group hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 group-hover:text-blue-700">Enviar arquivo técnico</h3>
                  <p className="text-sm text-stone-600 mt-1">PDF, DWG, ou outros arquivos de projeto</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setModalAberto('contato')}
              className="w-full bg-white p-6 rounded-xl shadow-sm border-2 border-stone-200 hover:border-green-500 transition-all text-left group hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <MessageCircle className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 group-hover:text-green-700">Contato direto</h3>
                  <p className="text-sm text-stone-600 mt-1">Converse diretamente com o marceneiro</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button 
              onClick={() => !enviando && !sucesso && setModalAberto(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-2xl"
              disabled={enviando}
            >
              ×
            </button>

            {sucesso ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-stone-800">Solicitação enviada!</h3>
                <p className="text-stone-600 mt-2">O marceneiro entrará em contato em breve.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-stone-800 mb-4">
                  {modalAberto === 'imagem' && 'Enviar prévia/imagem'}
                  {modalAberto === 'arquivo' && 'Enviar arquivo técnico'}
                  {modalAberto === 'contato' && 'Contato direto'}
                </h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.dataSelecionada}
                      onChange={(e) => setFormData({...formData, dataSelecionada: e.target.value})}
                    />
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.horaSelecionada}
                      onChange={(e) => setFormData({...formData, horaSelecionada: e.target.value})}
                    >
                      <option value="">Horário</option>
                      <option value="08:00">08:00</option>
                      <option value="10:00">10:00</option>
                      <option value="14:00">14:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>
                  {(modalAberto === 'imagem' || modalAberto === 'arquivo') && (
                    <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-amber-500 cursor-pointer relative">
                      <input 
                        type="file"
                        accept={modalAberto === 'imagem' ? 'image/*' : '.pdf,.dwg,.dxf'}
                        onChange={(e) => setArquivoSelecionado(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <span className="text-sm text-stone-600">
                        {arquivoSelecionado ? arquivoSelecionado.name : 'Clique para selecionar arquivo'}
                      </span>
                    </div>
                  )}
                  <textarea
                    placeholder="Descrição do projeto"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  />
                  <button 
                    onClick={() => handleSubmit(
                      modalAberto === 'imagem' ? 'preview_imagem' : 
                      modalAberto === 'arquivo' ? 'arquivo_tecnico' : 'contato_direto'
                    )}
                    disabled={enviando || !formData.nome || !formData.email || !formData.descricao}
                    className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    {enviando ? 'Enviando...' : 'Enviar solicitação'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
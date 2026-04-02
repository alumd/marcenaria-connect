'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, User, FileText, Image as ImageIcon, 
  MessageCircle, CheckCircle, XCircle, LogOut, Download,
  Plus, Trash2, MapPin, Phone, Mail, Wifi, WifiOff
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardProfissional() {
  const router = useRouter();
  const [profissionalId, setProfissionalId] = useState<string | null>(null);
  const [profissionalNome, setProfissionalNome] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'solicitacoes' | 'agenda' | 'perfil'>('solicitacoes');
  
  // Dados
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Realtime e atualização
  const [conexaoStatus, setConexaoStatus] = useState<'conectado' | 'desconectado'>('desconectado');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  // Modal de detalhes
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null);
  
  // Form nova agenda
  const [novaData, setNovaData] = useState('');
  const [novaHoraInicio, setNovaHoraInicio] = useState('08:00');
  const [novaHoraFim, setNovaHoraFim] = useState('10:00');

  useEffect(() => {
    const id = localStorage.getItem('profissional_id');
    const nome = localStorage.getItem('profissional_nome');
    
    if (!id) {
      router.push('/profissional/login');
      return;
    }
    
    setProfissionalId(id);
    setProfissionalNome(nome || '');
    carregarDados(id);
    
    // CONFIGURAÇÃO REALTIME - Atualizações em tempo real
    const canal = supabase
      .channel(`profissional_${id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'solicitacoes', filter: `profissional_id=eq.${id}` },
        (payload) => {
          console.log('🔄 Nova solicitação:', payload);
          carregarDados(id);
          setUltimaAtualizacao(new Date());
          // Som de notificação para novas solicitações
          if (payload.eventType === 'INSERT') {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'agenda', filter: `profissional_id=eq.${id}` },
        (payload) => {
          console.log('🔄 Agenda atualizada:', payload);
          carregarDados(id);
          setUltimaAtualizacao(new Date());
        }
      )
      .subscribe((status) => {
        console.log('Status Realtime:', status);
        setConexaoStatus(status === 'SUBSCRIBED' ? 'conectado' : 'desconectado');
      });

    // Fallback: atualizar a cada 1 segundo se realtime falhar
    const interval = setInterval(() => {
      carregarDados(id);
      setUltimaAtualizacao(new Date());
    }, 1000); // 1 segundo

    return () => {
      clearInterval(interval);
      supabase.removeChannel(canal);
    };
  }, [router]);

  async function carregarDados(id: string) {
    try {
      // Buscar solicitações
      const { data: sols } = await supabase
        .from('solicitacoes')
        .select('*')
        .eq('profissional_id', id)
        .order('created_at', { ascending: false });
      
      // Buscar agenda
      const { data: agendamentos } = await supabase
        .from('agenda')
        .select('*')
        .eq('profissional_id', id)
        .gte('data', new Date().toISOString().split('T')[0])
        .order('data', { ascending: true });
      
      setSolicitacoes(sols || []);
      setAgenda(agendamentos || []);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('profissional_id');
    localStorage.removeItem('profissional_nome');
    router.push('/profissional/login');
  }

  async function atualizarStatus(solicitacaoId: string, novoStatus: string) {
    await supabase
      .from('solicitacoes')
      .update({ status: novoStatus })
      .eq('id', solicitacaoId);
    
    // Não precisa chamar carregarDados manualmente - o Realtime vai atualizar!
    setSolicitacaoSelecionada(null);
  }

  async function adicionarHorario() {
    if (!profissionalId || !novaData) return;
    
    await supabase.from('agenda').insert({
      profissional_id: profissionalId,
      data: novaData,
      hora_inicio: novaHoraInicio,
      hora_fim: novaHoraFim,
      status: 'disponivel'
    });
    
    setNovaData('');
    // Não precisa chamar carregarDados - o Realtime vai atualizar!
  }

  async function removerHorario(agendaId: string) {
    await supabase.from('agenda').delete().eq('id', agendaId);
    // Não precisa chamar carregarDados - o Realtime vai atualizar!
  }

  async function toggleStatusAgenda(item: any) {
    const novoStatus = item.status === 'disponivel' ? 'ocupado' : 'disponivel';
    await supabase
      .from('agenda')
      .update({ status: novoStatus })
      .eq('id', item.id);
    // Não precisa chamar carregarDados - o Realtime vai atualizar!
  }

  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'pendente');
  const solicitacoesAceitas = solicitacoes.filter(s => s.status === 'aceito');

  if (!profissionalId) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header com indicador de conexão em tempo real */}
      <header className="bg-stone-900 text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-amber-500">Painel do Profissional</h1>
            <p className="text-sm text-stone-400">Olá, {profissionalNome}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Indicador de conexão ao vivo */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700">
              {conexaoStatus === 'conectado' ? (
                <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
              ) : (
                <WifiOff className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-xs font-medium">
                {conexaoStatus === 'conectado' ? 'AO VIVO' : 'SINCRONIZANDO...'}
              </span>
              <span className="text-xs text-stone-500 border-l border-stone-600 pl-2">
                {ultimaAtualizacao.toLocaleTimeString()}
              </span>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Abas */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            {[
              { id: 'solicitacoes', label: 'Solicitações', count: solicitacoesPendentes.length },
              { id: 'agenda', label: 'Minha Agenda', count: agenda.length },
              { id: 'perfil', label: 'Perfil', count: null }
            ].map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === aba.id 
                    ? 'border-amber-500 text-amber-600' 
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                {aba.label}
                {aba.count !== null && aba.count > 0 && (
                  <span className="ml-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs animate-bounce">
                    {aba.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo - AGENDA COM ATUALIZAÇÃO EM TEMPO REAL */}
      <main className="container mx-auto px-4 py-8">
        
        {abaAtiva === 'solicitacoes' && (
          <div className="space-y-6">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 relative overflow-hidden">
                <div className="text-2xl font-bold text-amber-600">{solicitacoesPendentes.length}</div>
                <div className="text-sm text-stone-600">Novas solicitações</div>
                {solicitacoesPendentes.length > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                <div className="text-2xl font-bold text-green-600">{solicitacoesAceitas.length}</div>
                <div className="text-sm text-stone-600">Aceitas este mês</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                <div className="text-2xl font-bold text-blue-600">{agenda.filter(a => a.status === 'disponivel').length}</div>
                <div className="text-sm text-stone-600">Horários disponíveis</div>
              </div>
            </div>

            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              Solicitações Recentes
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full animate-pulse">
                ATUALIZA 1s
              </span>
            </h2>
            
            {solicitacoes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                <p className="text-stone-500">Nenhuma solicitação recebida ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitacoes.map((sol) => (
                  <div 
                    key={sol.id} 
                    className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                      sol.status === 'pendente' ? 'border-amber-300 bg-amber-50/30 border-l-4 border-l-amber-500' : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-stone-800 text-lg">{sol.cliente_nome}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sol.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                            sol.status === 'aceito' ? 'bg-green-100 text-green-700' :
                            sol.status === 'recusado' ? 'bg-red-100 text-red-700' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {sol.status === 'pendente' ? 'NOVA' : 
                             sol.status === 'aceito' ? 'Aceita' : 
                             sol.status === 'recusado' ? 'Recusada' : 'Concluída'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {sol.cliente_email}
                          </span>
                          {sol.cliente_telefone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {sol.cliente_telefone}
                            </span>
                          )}
                        </div>

                        <p className="text-stone-600 text-sm line-clamp-2">{sol.descricao}</p>

                        {sol.data_solicitada && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-stone-600 bg-stone-100 w-fit px-3 py-1 rounded-lg">
                            <Calendar className="w-4 h-4" />
                            Preferência: {new Date(sol.data_solicitada).toLocaleDateString('pt-BR')} às {sol.hora_solicitada?.slice(0,5)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {sol.status === 'pendente' && (
                          <>
                            <button 
                              onClick={() => atualizarStatus(sol.id, 'aceito')}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Aceitar
                            </button>
                            <button 
                              onClick={() => atualizarStatus(sol.id, 'recusado')}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Recusar
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setSolicitacaoSelecionada(sol)}
                          className="flex items-center gap-1 px-3 py-1 border border-stone-300 text-stone-700 rounded-lg text-sm hover:bg-stone-50 transition-colors"
                        >
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: AGENDA COM ATUALIZAÇÃO AUTOMÁTICA */}
        {abaAtiva === 'agenda' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Horário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm text-stone-600 mb-1">Data</label>
                  <input 
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-600 mb-1">Início</label>
                  <input 
                    type="time"
                    value={novaHoraInicio}
                    onChange={(e) => setNovaHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-600 mb-1">Fim</label>
                  <input 
                    type="time"
                    value={novaHoraFim}
                    onChange={(e) => setNovaHoraFim(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button 
                  onClick={adicionarHorario}
                  disabled={!novaData}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-800">Meus Horários</h3>
                <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded animate-pulse">
                  Atualiza automaticamente
                </span>
              </div>
              
              {agenda.length === 0 ? (
                <p className="text-stone-500 text-center py-8">Nenhum horário cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {agenda.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        item.status === 'disponivel' 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                          : 'bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'disponivel' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium text-stone-800">
                            {new Date(item.data).toLocaleDateString('pt-BR', { 
                              weekday: 'long', day: 'numeric', month: 'short' 
                            })}
                          </div>
                          <div className="text-sm text-stone-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {item.hora_inicio.slice(0,5)} às {item.hora_fim.slice(0,5)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleStatusAgenda(item)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            item.status === 'disponivel'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {item.status === 'disponivel' ? 'Marcar Ocupado' : 'Liberar'}
                        </button>
                        <button 
                          onClick={() => removerHorario(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'perfil' && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-stone-800 mb-6">Meu Perfil</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-3xl font-bold text-amber-700">
                  {profissionalNome.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profissionalNome}</h3>
                  <p className="text-stone-500">ID: {profissionalId}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-stone-200">
                <p className="text-sm text-stone-500">
                  Sistema em tempo real ativo. Atualizações a cada 1 segundo.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalhes (mantenha igual) */}
      {solicitacaoSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-stone-800">Detalhes da Solicitação</h3>
              <button 
                onClick={() => setSolicitacaoSelecionada(null)}
                className="text-stone-400 hover:text-stone-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-stone-400" />
                <div>
                  <div className="font-medium text-stone-800">{solicitacaoSelecionada.cliente_nome}</div>
                  <div className="text-sm text-stone-500">{solicitacaoSelecionada.cliente_email}</div>
                </div>
              </div>

              {solicitacaoSelecionada.cliente_telefone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-stone-400" />
                  <a href={`tel:${solicitacaoSelecionada.cliente_telefone}`} className="text-amber-600 hover:underline">
                    {solicitacaoSelecionada.cliente_telefone}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-3">
                {solicitacaoSelecionada.tipo_contato === 'preview_imagem' && <ImageIcon className="w-5 h-5 text-amber-500" />}
                {solicitacaoSelecionada.tipo_contato === 'arquivo_tecnico' && <FileText className="w-5 h-5 text-blue-500" />}
                {solicitacaoSelecionada.tipo_contato === 'contato_direto' && <MessageCircle className="w-5 h-5 text-green-500" />}
                <span className="text-stone-700">
                  {solicitacaoSelecionada.tipo_contato === 'preview_imagem' && 'Envio de Imagem/Preview'}
                  {solicitacaoSelecionada.tipo_contato === 'arquivo_tecnico' && 'Arquivo Técnico'}
                  {solicitacaoSelecionada.tipo_contato === 'contato_direto' && 'Contato Direto'}
                </span>
              </div>

              {solicitacaoSelecionada.data_solicitada && (
                <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-lg">
                  <Calendar className="w-5 h-5 text-stone-400" />
                  <div>
                    <div className="text-sm text-stone-500">Data preferida:</div>
                    <div className="font-medium text-stone-800">
                      {new Date(solicitacaoSelecionada.data_solicitada).toLocaleDateString('pt-BR', { 
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                      })} às {solicitacaoSelecionada.hora_solicitada?.slice(0,5)}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-stone-200 pt-4">
                <h4 className="font-medium text-stone-800 mb-2">Descrição:</h4>
                <p className="text-stone-600 whitespace-pre-wrap">{solicitacaoSelecionada.descricao}</p>
              </div>

              {solicitacaoSelecionada.imagem_url && (
                <div className="border-t border-stone-200 pt-4">
                  <h4 className="font-medium text-stone-800 mb-2">Imagem:</h4>
                  <a href={solicitacaoSelecionada.imagem_url} target="_blank" className="flex items-center gap-2 text-amber-600 hover:underline">
                    <Download className="w-4 h-4" />
                    Ver/Baixar
                  </a>
                </div>
              )}

              {solicitacaoSelecionada.arquivo_url && (
                <div className="border-t border-stone-200 pt-4">
                  <h4 className="font-medium text-stone-800 mb-2">Arquivo:</h4>
                  <a href={solicitacaoSelecionada.arquivo_url} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <Download className="w-4 h-4" />
                    Baixar
                  </a>
                </div>
              )}

              {solicitacaoSelecionada.status === 'pendente' && (
                <div className="flex gap-3 pt-6 border-t border-stone-200">
                  <button 
                    onClick={() => atualizarStatus(solicitacaoSelecionada.id, 'aceito')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aceitar
                  </button>
                  <button 
                    onClick={() => atualizarStatus(solicitacaoSelecionada.id, 'recusado')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Recusar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
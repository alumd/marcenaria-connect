export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Política de Privacidade</h1>
        <p className="text-zinc-500 mb-8">Conforme a LGPD - Lei Geral de Proteção de Dados</p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">1. Dados Coletados</h2>
            <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Telefone</li>
              <li>Cidade/Localização</li>
              <li>Dados de perfil (para profissionais)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">2. Uso dos Dados</h2>
            <p className="text-zinc-600 leading-relaxed">
              Utilizamos seus dados para conectar clientes e profissionais, enviar notificações sobre 
              solicitações e melhorar nossa plataforma. Não vendemos seus dados para terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">3. Cookies</h2>
            <p className="text-zinc-600 leading-relaxed">
              Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de 
              preferências para melhorar sua experiência. Você pode gerenciar isso nas configurações do navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">4. Seus Direitos</h2>
            <p className="text-zinc-600 leading-relaxed">
              Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento 
              através da página de configurações ou entrando em contato.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
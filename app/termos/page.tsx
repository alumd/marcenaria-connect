export default function TermosPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Termos de Uso</h1>
        <p className="text-zinc-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        
        <div className="prose prose-zinc max-w-none">
          <h2 className="text-xl font-semibold text-zinc-900 mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Ao acessar e usar a plataforma Marcenaria Connect, você concorda em cumprir estes termos. 
            Se não concordar, por favor não utilize nossos serviços.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8 mb-4">2. Serviços Oferecidos</h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            A Marcenaria Connect atua como intermediária entre clientes e profissionais da marcenaria. 
            Não nos responsabilizamos diretamente pela execução dos serviços contratados.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8 mb-4">3. Cadastro</h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Para usar a plataforma é necessário criar uma conta fornecendo informações verdadeiras. 
            O usuário é responsável por manter a confidencialidade de sua senha.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8 mb-4">4. Privacidade</h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Respeitamos sua privacidade. Os dados são processados conforme nossa Política de Privacidade.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8 mb-4">5. Modificações</h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Podemos modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após publicação.
          </p>
        </div>
      </div>
    </div>
  )
}
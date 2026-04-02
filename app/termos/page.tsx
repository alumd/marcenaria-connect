export default function TermosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-white min-h-screen">
      <div className="mb-8 border-b border-amber-200 pb-4">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Termos de Uso</h1>
        <p className="text-stone-600">Marcenaria Connect - Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div className="prose prose-stone max-w-none text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900 mt-6 mb-3">1. Aceitação dos Termos</h2>
        <p className="mb-4">Ao acessar e usar a Marcenaria Connect, você concorda em cumprir estes termos...</p>
        
        <h2 className="text-xl font-semibold text-stone-900 mt-6 mb-3">2. Cookies e Tecnologias</h2>
        <p className="mb-4">Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de preferências para melhorar sua experiência...</p>
        
        <h2 className="text-xl font-semibold text-stone-900 mt-6 mb-3">3. Responsabilidades</h2>
        <p>A Marcenaria Connect atua como intermediária entre clientes e profissionais...</p>
      </div>
    </div>
  )
}
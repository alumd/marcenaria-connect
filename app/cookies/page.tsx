export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Política de Cookies</h1>
        <p className="text-zinc-500 mb-8">Entenda como usamos cookies</p>
        
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="font-semibold text-amber-900 mb-2">O que são cookies?</h2>
            <p className="text-amber-800 text-sm">
              Cookies são pequenos arquivos de texto armazenados no seu navegador para melhorar sua experiência.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Cookies Essenciais</h3>
            <p className="text-zinc-600 text-sm">
              Necessários para o funcionamento básico da plataforma (login, segurança, preferências). 
              Não podem ser desativados.
            </p>

            <h3 className="font-semibold text-zinc-900">Cookies de Preferências</h3>
            <p className="text-zinc-600 text-sm">
              Lembram suas escolhas (como cidade preferida) para personalizar sua experiência.
            </p>

            <h3 className="font-semibold text-zinc-900">Como gerenciar?</h3>
            <p className="text-zinc-600 text-sm">
              Você pode limpar os cookies nas configurações do seu navegador a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
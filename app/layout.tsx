import './globals.css'
import Header from './components/Header'
import CookieConsent from './components/CookieConsent'
import Footer from './components/Footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="flex flex-col min-h-screen bg-zinc-50">
        {/* Navegação em todas as páginas */}
        <Header />
        
        <main className="flex-1">
          {children}
        </main>

        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
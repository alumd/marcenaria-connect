import Link from 'next/link'
import { Shield, ExternalLink, Copyright, Hammer, FileText, Lock } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-stone-950 text-stone-400 py-8 mt-auto border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Copyright + Logo */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Hammer className="w-5 h-5" />
              <span className="font-bold text-stone-100">Marcenaria Connect</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Copyright className="w-4 h-4" />
              <span>{currentYear} - Todos os direitos reservados</span>
            </div>
          </div>

          {/* Links Legais */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link 
              href="/termos" 
              className="flex items-center gap-1 hover:text-amber-400 transition-colors group"
            >
              <FileText className="w-4 h-4 group-hover:text-amber-500" />
              <span className="underline underline-offset-2">Termos de Uso</span>
            </Link>
            
            <Link 
              href="/privacidade" 
              className="flex items-center gap-1 hover:text-amber-400 transition-colors group"
            >
              <Lock className="w-4 h-4 group-hover:text-amber-500" />
              <span className="underline underline-offset-2">Privacidade</span>
            </Link>
            
            <Link 
              href="/cookies" 
              className="flex items-center gap-1 hover:text-amber-400 transition-colors group"
            >
              <Shield className="w-4 h-4 group-hover:text-amber-500" />
              <span className="underline underline-offset-2">Cookies</span>
            </Link>
          </div>

          {/* Reclame Aqui */}
          <div className="flex items-center justify-center md:justify-end">
            <a 
              href="https://www.reclameaqui.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-green-600/20 border border-green-500"
            >
              <Shield className="w-5 h-5" />
              <span>Reclame Aqui</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="border-t border-stone-800 mt-6 pt-6 text-center text-xs text-stone-600">
          <p>Plataforma de conexão entre clientes e profissionais da marcenaria</p>
          <p className="mt-1">Dados protegidos conforme LGPD - Lei Geral de Proteção de Dados</p>
        </div>
      </div>
    </footer>
  )
}
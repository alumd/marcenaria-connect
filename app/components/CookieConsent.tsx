'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Shield } from 'lucide-react'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent-marcenaria')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent-marcenaria', 'accepted')
    localStorage.setItem('cookie-date', new Date().toISOString())
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent-marcenaria', 'declined')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t-4 border-amber-600 shadow-2xl p-4 md:p-6 text-stone-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-amber-600 p-2 rounded-full">
            <Cookie className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Sua Privacidade é Importante
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Utilizamos cookies para melhorar sua experiência na Marcenaria Connect. 
              Ao continuar, você aceita nossos{' '}
              <a href="/termos" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-medium">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="/privacidade" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-medium">
                Política de Privacidade
              </a>.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2 text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors border border-stone-700"
          >
            Recusar
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg hover:shadow-amber-600/20"
          >
            Aceitar Cookies
          </button>
        </div>
        
        <button 
          onClick={handleDecline}
          className="absolute top-2 right-2 md:static text-stone-500 hover:text-stone-300 md:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
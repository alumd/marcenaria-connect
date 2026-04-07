import Link from 'next/link'
import Image from 'next/image'
import { 
  Hammer, 
  TreePine, 
  Sofa, 
  DoorOpen, 
  LayoutGrid,  // <-- ADICIONAR (para Revestimentos)
  Palette, 
  ArrowRight, 
  Star,
  CheckCircle2,
  User  // <-- ADICIONAR (para os botões de navegação)
} from 'lucide-react'

const categorias = [
  {
    id: 'cortes-organicos',
    nome: 'Cortes Orgânicos',
    descricao: 'Móveis com design natural e bordas vivas',
    icone: TreePine,
    imagem: '/images/organico.jpg',
    cor: 'bg-amber-600'
  },
  {
    id: 'moveis-planejados',
    nome: 'Móveis Planejados',
    descricao: 'Cozinhas, closets e ambientes sob medida',
    icone: Sofa,
    imagem: '/images/planejado.jpg',
    cor: 'bg-stone-600'
  },
  {
    id: 'portas-janelas',
    nome: 'Portas & Janelas',
    descricao: 'Esquadrias em madeira maciça',
    icone: DoorOpen,
    imagem: '/images/portas.jpg',
    cor: 'bg-amber-700'
  },
  {
    id: 'revestimentos',  // <-- CORRIGIDO (era restauracao)
    nome: 'Revestimentos',
    descricao: 'Painéis, ripados e revestimentos de parede',
    icone: LayoutGrid,  // <-- CORRIGIDO (era Scissors)
    imagem: '/images/revestimento.jpg',
    cor: 'bg-stone-700'
  },
  {
    id: 'esculturas',
    nome: 'Esculturas & Artes',
    descricao: 'Peças decorativas únicas',
    icone: Palette,
    imagem: '/images/arte.jpg',
    cor: 'bg-amber-800'
  },
  {
    id: 'servicos-gerais',
    nome: 'Serviços Gerais',
    descricao: 'Reparos e pequenos trabalhos',
    icone: Hammer,
    imagem: '/images/geral.jpg',
    cor: 'bg-stone-800'
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* HERO SECTION */}
      <section className="relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-repeat" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Lado Esquerdo - Texto */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                <span>Conectando clientes aos melhores marceneiros</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Transforme sua casa com{' '}
                <span className="text-amber-500">móveis artesanais</span>
              </h1>

              <p className="text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0">
                Encontre profissionais qualificados em marcenaria. 
                Do projeto à execução, realizamos seus sonhos em madeira.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="#categorias"
                  className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-amber-600/20"
                >
                  Explorar Categorias
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/cadastro-profissional"
                  className="inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-lg font-semibold transition-all border border-zinc-700"
                >
                  Sou Profissional
                </Link>
              </div>
            </div>

            {/* Lado Direito - Grid de Imagens */}
            <div className="relative grid grid-cols-2 gap-4">
              <div className="col-span-2 relative h-64 lg:h-80 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <Image
                  src="/images/hero-principal.jpg"
                  alt="Marcenaria artesanal"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-4 z-20 text-white">
                  <p className="text-sm font-medium text-amber-400">Destaque</p>
                  <p className="text-lg font-bold">Móveis Sob Medida</p>
                </div>
              </div>

              <div className="relative h-40 rounded-xl overflow-hidden shadow-lg">
                <Image src="/images/trabalho1.jpg" alt="Trabalho 1" fill className="object-cover" />
              </div>
              <div className="relative h-40 rounded-xl overflow-hidden shadow-lg">
                <Image src="/images/trabalho2.jpg" alt="Trabalho 2" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE CATEGORIAS */}
      <section id="categorias" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-4">
              Escolha a categoria do seu projeto
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Selecione o tipo de serviço que precisa e encontre os melhores profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((categoria) => {
              const Icon = categoria.icone
              return (
                <Link
                  key={categoria.id}
                  href={`/categoria/${categoria.id}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                    <Image
                      src={categoria.imagem}
                      alt={categoria.nome}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    <div className="absolute top-4 right-4 z-20">
                      <div className={`${categoria.cor} p-3 rounded-full shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {categoria.nome}
                      </h3>
                      <p className="text-zinc-200 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {categoria.descricao}
                      </p>
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm opacity-0 group-hover:opacity-100">
                        <span>Ver profissionais</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO DE NAVEGAÇÃO - BOTÕES DE AÇÃO */}
      <section className="py-16 bg-amber-50 border-y border-amber-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-8">Como deseja começar?</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-zinc-800 transition-all hover:scale-105"
            >
              <User className="w-5 h-5" />
              Quero contratar um profissional
            </Link>
            
            <Link 
              href="/cadastro-profissional"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-amber-700 transition-all hover:scale-105 shadow-lg shadow-amber-600/20"
            >
              <Hammer className="w-5 h-5" />
              Sou profissional e quero trabalhar
            </Link>
          </div>

          <p className="mt-6 text-zinc-600">
            Já tem conta?{' '}
            <Link href="/login" className="text-amber-600 font-bold hover:underline">
              Faça login aqui →
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
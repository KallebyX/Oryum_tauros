import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import {
  BarChart3,
  Leaf,
  TrendingUp,
  Users,
  Award,
  Target,
  ArrowRight,
  Check,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            )}
            <span className="font-bold text-xl text-primary">{APP_TITLE}</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Funcionalidades
            </Link>
            <Link href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">
              Benefícios
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Planos
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button>Acessar Dashboard</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Entrar</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🌱 Gestão Rural Inteligente
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transforme sua fazenda com{" "}
                <span className="text-primary">tecnologia e sustentabilidade</span>
              </h1>
              <p className="text-xl text-gray-600">
                ERP completo para produtores rurais com gestão econômica, métricas ESG, 
                indicadores zootécnicos e gamificação. Aumente sua produtividade e conquiste 
                selos de sustentabilidade.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-8">
                      Acessar Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="text-lg px-8">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                )}
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Ver Planos
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-gray-600">Fazendas Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">R$2M+</div>
                  <div className="text-sm text-gray-600">Economizados</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl shadow-2xl flex items-center justify-center">
                <BarChart3 className="w-48 h-48 text-white opacity-20" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Lucro Mensal</div>
                    <div className="text-xl font-bold text-gray-900">+32%</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Selo ESG</div>
                    <div className="text-xl font-bold text-gray-900">Ouro</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Módulos completos para gestão rural moderna e sustentável
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Gestão Financeira",
                description: "Controle completo de receitas, despesas e fluxo de caixa com relatórios detalhados",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Users,
                title: "Gestão de Animais",
                description: "Rastreabilidade individual com RFID, pesagens, GMD e produção de leite",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Leaf,
                title: "Métricas ESG",
                description: "Checklist interativo, cálculo automático de score e conquista de selos",
                color: "bg-emerald-100 text-emerald-600",
              },
              {
                icon: Target,
                title: "Gamificação",
                description: "Desafios mensais, ranking regional e nacional, sistema de pontos",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: TrendingUp,
                title: "Indicadores Zootécnicos",
                description: "GMD, ICA, taxa de prenhez, produção de leite e conversão alimentar",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: Award,
                title: "Motor de IA",
                description: "Recomendações personalizadas e sugestões para melhorar seu selo ESG",
                color: "bg-pink-100 text-pink-600",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o {APP_TITLE}?
              </h2>
              <div className="space-y-4">
                {[
                  "Aumente sua produtividade em até 40%",
                  "Reduza custos com gestão inteligente de estoque",
                  "Conquiste selos de sustentabilidade e agregue valor",
                  "Tome decisões baseadas em dados reais",
                  "Acesse de qualquer lugar, a qualquer momento",
                  "Suporte especializado em gestão rural",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-lg text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Resultados Comprovados</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Aumento de Lucro</span>
                    <span className="font-bold text-green-600">+32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "32%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Redução de Custos</span>
                    <span className="font-bold text-green-600">-25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Melhoria em GMD</span>
                    <span className="font-bold text-green-600">+18%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "18%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Score ESG</span>
                    <span className="font-bold text-green-600">+45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar sua fazenda?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a centenas de produtores que já estão aumentando sua produtividade 
            e conquistando selos de sustentabilidade
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Acessar Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            )}
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-green-600">
                Ver Planos e Preços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {APP_LOGO && (
                  <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
                )}
                <span className="font-bold text-xl text-white">{APP_TITLE}</span>
              </div>
              <p className="text-sm">
                ERP Rural Inteligente para gestão sustentável e produtiva
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Planos</Link></li>
                <li><Link href="#benefits" className="hover:text-white transition-colors">Benefícios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 {APP_TITLE}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

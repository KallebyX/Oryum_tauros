import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sprout, TrendingUp, Award, Target, BarChart3, Leaf } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.farmId) {
        setLocation("/dashboard");
      } else {
        setLocation("/onboarding");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sprout className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Leaf className="w-4 h-4" />
              ERP Rural Inteligente
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Transforme sua fazenda com{" "}
              <span className="text-primary">gestão inteligente</span> e{" "}
              <span className="text-primary">sustentabilidade</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Una gestão econômica, métricas ESG e gamificação para aumentar a rentabilidade 
              e promover práticas sustentáveis na sua propriedade rural.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild className="text-lg px-8">
                <a href={getLoginUrl()}>Começar Agora</a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => setLocation("/pricing")}>
                Ver Planos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Funcionalidades Principais</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua fazenda de forma eficiente e sustentável
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Gestão Financeira</h4>
                <p className="text-muted-foreground">
                  Controle completo de vendas, compras e custos por lote, animal ou hectare. 
                  Relatórios detalhados para tomada de decisão.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Métricas ESG</h4>
                <p className="text-muted-foreground">
                  Avalie e melhore suas práticas ambientais, sociais e de governança. 
                  Conquiste selos Bronze, Prata e Ouro.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Gamificação</h4>
                <p className="text-muted-foreground">
                  Participe de desafios mensais, ganhe medalhas e compare seu desempenho 
                  no ranking regional e nacional.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Dashboard Inteligente</h4>
                <p className="text-muted-foreground">
                  Visualize KPIs financeiros e ambientais lado a lado. 
                  Gráficos e métricas em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Recomendações IA</h4>
                <p className="text-muted-foreground">
                  Receba sugestões personalizadas baseadas em seus dados para 
                  aumentar rentabilidade e sustentabilidade.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sprout className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Gestão de Estoque</h4>
                <p className="text-muted-foreground">
                  Controle ração, medicamentos e insumos. Alertas de validade 
                  e estoque mínimo automáticos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="container text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar sua fazenda?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a centenas de produtores que já estão aumentando sua rentabilidade 
            e sustentabilidade com o Oryum Tauros.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <a href={getLoginUrl()}>Começar Gratuitamente</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 {APP_TITLE}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

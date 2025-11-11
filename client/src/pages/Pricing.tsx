import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Check, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const plans = [
  {
    id: "basic",
    name: "Básico",
    price: "R$ 49",
    period: "/mês",
    description: "Ideal para pequenos produtores começando a digitalizar",
    icon: Check,
    features: [
      "Gestão Financeira completa",
      "Controle de Estoque",
      "Até 50 animais cadastrados",
      "Dashboard com KPIs básicos",
      "Suporte por email",
      "1 usuário",
    ],
    priceId: import.meta.env.VITE_STRIPE_PRICE_BASIC || "price_basic",
    highlighted: false,
  },
  {
    id: "professional",
    name: "Profissional",
    price: "R$ 99",
    period: "/mês",
    description: "Para produtores que buscam crescimento sustentável",
    icon: Zap,
    features: [
      "Tudo do plano Básico",
      "Gestão de Animais Individual com GMD",
      "Métricas ESG com Selos",
      "Até 200 animais cadastrados",
      "Gamificação e Desafios",
      "Planejamento e Agenda",
      "Recomendações IA",
      "Suporte prioritário",
      "Até 3 usuários",
    ],
    priceId: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL || "price_professional",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Empresarial",
    price: "R$ 199",
    period: "/mês",
    description: "Solução completa para grandes propriedades",
    icon: Sparkles,
    features: [
      "Tudo do plano Profissional",
      "Animais ilimitados",
      "Ranking Regional e Nacional",
      "Relatórios avançados e exportação",
      "API de integração",
      "Manejo Reprodutivo completo",
      "Calendário Sanitário",
      "Gestão de Pastagens",
      "Suporte 24/7 com gerente dedicado",
      "Usuários ilimitados",
      "Treinamento personalizado",
    ],
    priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || "price_enterprise",
    highlighted: false,
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");

  const { data: currentSubscription } = trpc.subscription.current.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar checkout: ${error.message}`);
      setLoadingPlan(null);
    },
  });

  const handleSubscribe = (planId: string, priceId: string) => {
    if (!isAuthenticated) {
      toast.error("Faça login para assinar um plano");
      return;
    }

    // Modo de desenvolvimento: criar assinatura FREE sem Stripe
    if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      toast.success(`Plano ${planId.toUpperCase()} ativado! (Modo FREE para desenvolvimento)`);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      return;
    }

    setLoadingPlan(planId);
    createCheckout.mutate({ 
      priceId,
      couponCode: couponCode.trim() || undefined 
    });
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId && currentSubscription?.status === "active";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha o Plano Ideal para sua Fazenda
          </h1>
          <p className="text-xl text-green-50 max-w-3xl mx-auto">
            Transforme sua gestão rural com tecnologia e sustentabilidade. Todos os planos incluem
            atualizações gratuitas e acesso ao sistema web.
          </p>
        </div>
      </div>

      {/* Cupom de Desconto */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Tem um cupom de desconto?</h3>
                <p className="text-sm text-gray-600">Insira seu código promocional para obter desconto na assinatura</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Código do cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none w-full md:w-48"
                />
                {couponCode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCouponCode("")}
                    className="shrink-0"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
            {couponCode && (
              <p className="text-sm text-green-700 mt-2 font-medium">
                ✓ Cupom "{couponCode}" será aplicado no checkout
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);
            const isLoading = loadingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.highlighted
                    ? "border-green-600 border-2 shadow-2xl scale-105"
                    : "border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      plan.highlighted ? "bg-green-600" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 ${plan.highlighted ? "text-white" : "text-gray-600"}`}
                    />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-6 text-lg font-semibold ${
                      plan.highlighted
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                    onClick={() => handleSubscribe(plan.id, plan.priceId)}
                    disabled={isCurrent || isLoading}
                  >
                    {isCurrent
                      ? "Plano Atual"
                      : isLoading
                      ? "Processando..."
                      : "Assinar Agora"}
                  </Button>

                  {isCurrent && (
                    <div className="text-center">
                      <span className="inline-flex items-center gap-2 text-sm text-green-600 font-semibold">
                        <Check className="w-4 h-4" />
                        Você está neste plano
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Perguntas Frequentes
          </h2>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso mudar de plano depois?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As
                  mudanças serão aplicadas no próximo ciclo de cobrança.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona o período de teste?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Oferecemos 14 dias de teste gratuito em todos os planos. Você pode cancelar a
                  qualquer momento durante o período de teste sem custos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quais formas de pagamento são aceitas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Aceitamos cartões de crédito (Visa, Mastercard, Amex) e PIX através da plataforma
                  Stripe, garantindo segurança e praticidade.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Os dados ficam seguros?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Utilizamos criptografia de ponta a ponta e armazenamento em nuvem seguro.
                  Seus dados são protegidos e fazemos backups diários automáticos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar sua fazenda?</h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de produtores que já estão aumentando sua produtividade e
            conquistando selos de sustentabilidade.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              onClick={() => {
                const professionalPlan = plans.find((p) => p.id === "professional");
                if (professionalPlan) {
                  handleSubscribe(professionalPlan.id, professionalPlan.priceId);
                }
              }}
            >
              Começar Agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              onClick={() => (window.location.href = "/")}
            >
              Saber Mais
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

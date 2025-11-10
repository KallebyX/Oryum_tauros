import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Sparkles } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Plan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Ideal para pequenas propriedades',
    priceId: process.env.VITE_STRIPE_PRICE_BASIC || 'price_basic',
    price: 4900,
    currency: 'BRL',
    interval: 'mês',
    features: [
      'Gestão financeira básica',
      'Controle de estoque',
      'Dashboard com KPIs',
      'Até 100 animais',
      'Suporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Para fazendas em crescimento',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL || 'price_professional',
    price: 9900,
    currency: 'BRL',
    interval: 'mês',
    recommended: true,
    features: [
      'Tudo do plano Básico',
      'Métricas ESG completas',
      'Sistema de gamificação',
      'Ranking regional',
      'Até 500 animais',
      'Recomendações IA (5/mês)',
      'Suporte prioritário',
    ],
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    description: 'Para grandes operações',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    price: 19900,
    currency: 'BRL',
    interval: 'mês',
    features: [
      'Tudo do plano Profissional',
      'Animais ilimitados',
      'Recomendações IA ilimitadas',
      'Relatórios personalizados',
      'API de integração',
      'Múltiplas fazendas',
      'Suporte 24/7',
      'Gerente de conta dedicado',
    ],
  },
];

function formatPrice(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecionando para o checkout...");
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar checkout: " + error.message);
    },
  });

  const handleSubscribe = (plan: Plan) => {
    if (!isAuthenticated) {
      toast.info("Faça login para assinar");
      window.location.href = getLoginUrl();
      return;
    }

    createCheckout.mutate({
      priceId: plan.priceId,
      planId: plan.id,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            ← Voltar
          </Button>
          <h1 className="text-xl font-bold text-foreground">{APP_TITLE}</h1>
          {isAuthenticated ? (
            <Button onClick={() => setLocation("/dashboard")}>Dashboard</Button>
          ) : (
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          )}
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha o plano ideal para sua fazenda
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comece gratuitamente e escale conforme sua operação cresce
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.recommended
                    ? 'border-primary border-2 shadow-xl scale-105'
                    : 'border-2'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Recomendado
                    </div>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.recommended ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan)}
                    disabled={createCheckout.isPending}
                  >
                    {createCheckout.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center text-muted-foreground">
            <p className="mb-2">
              💳 Teste com o cartão <code className="bg-muted px-2 py-1 rounded">4242 4242 4242 4242</code>
            </p>
            <p className="text-sm">
              Todos os planos incluem 14 dias de teste grátis • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

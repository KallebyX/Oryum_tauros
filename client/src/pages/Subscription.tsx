import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Check, CreditCard, Calendar, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";

const planNames: Record<string, string> = {
  basic: "Básico",
  professional: "Profissional",
  enterprise: "Empresarial",
};

const planPrices: Record<string, string> = {
  basic: "R$ 49",
  professional: "R$ 99",
  enterprise: "R$ 199",
};

const planFeatures: Record<string, string[]> = {
  basic: [
    "Gestão Financeira completa",
    "Controle de Estoque",
    "Até 50 animais cadastrados",
    "Dashboard com KPIs básicos",
    "Suporte por email",
  ],
  professional: [
    "Tudo do plano Básico",
    "Gestão de Animais Individual com GMD",
    "Métricas ESG com Selos",
    "Até 200 animais cadastrados",
    "Gamificação e Desafios",
    "Recomendações IA",
  ],
  enterprise: [
    "Tudo do plano Profissional",
    "Animais ilimitados",
    "Ranking Regional e Nacional",
    "Relatórios avançados",
    "Manejo Reprodutivo completo",
    "Suporte 24/7",
  ],
};

export default function Subscription() {
  const { user, isAuthenticated, loading } = useAuth();
  const createPortalMutation = trpc.subscription.createPortalSession.useMutation();
  
  const { data: subscription, isLoading, refetch } = trpc.subscription.current.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Faça login para gerenciar sua assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/pricing"} className="w-full">
              Ver Planos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasActiveSubscription = subscription && subscription.status === "active";
  const planId = subscription?.planId || "basic";
  const planName = planNames[planId] || planId;
  const planPrice = planPrices[planId] || "N/A";
  const features = planFeatures[planId] || [];

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    past_due: "bg-yellow-100 text-yellow-800",
    incomplete: "bg-gray-100 text-gray-800",
  };

  const statusLabels: Record<string, string> = {
    active: "Ativa",
    canceled: "Cancelada",
    past_due: "Pagamento Pendente",
    incomplete: "Incompleta",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Assinatura
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie sua assinatura do {APP_TITLE}
          </p>
        </div>

        {!hasActiveSubscription ? (
          /* Sem Assinatura Ativa */
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <CardTitle className="text-yellow-900">Nenhuma Assinatura Ativa</CardTitle>
                  <CardDescription className="text-yellow-700">
                    Você não possui uma assinatura ativa no momento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-800 mb-4">
                Assine um de nossos planos para ter acesso completo a todas as funcionalidades do {APP_TITLE}.
              </p>
              <Button 
                onClick={() => window.location.href = "/pricing"}
                className="bg-green-600 hover:bg-green-700"
              >
                Ver Planos Disponíveis
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Com Assinatura Ativa */
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card do Plano Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Plano Atual</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[subscription.status]}`}>
                    {statusLabels[subscription.status]}
                  </span>
                </CardTitle>
                <CardDescription>Detalhes da sua assinatura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{planName}</h3>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {planPrice}<span className="text-lg text-gray-500">/mês</span>
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Recursos inclusos:</h4>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Card de Informações de Cobrança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informações de Cobrança
                </CardTitle>
                <CardDescription>Próximas cobranças e histórico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.currentPeriodEnd && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Próxima Cobrança</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}

                {subscription.stripeSubscriptionId && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">ID da Assinatura</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {subscription.stripeSubscriptionId.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={createPortalMutation.isPending}
                    onClick={async () => {
                      try {
                        const result = await createPortalMutation.mutateAsync();
                        if (result.url) {
                          window.location.href = result.url;
                        }
                      } catch (error) {
                        toast.error("Erro ao abrir portal de gerenciamento");
                        console.error(error);
                      }
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {createPortalMutation.isPending ? "Abrindo..." : "Gerenciar Pagamento e Assinatura"}
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Use o portal acima para atualizar método de pagamento, visualizar faturas, fazer upgrade/downgrade ou cancelar sua assinatura.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Informações Adicionais */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Precisa de Ajuda?</CardTitle>
            <CardDescription>Entre em contato com nosso suporte</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Se você tiver dúvidas sobre sua assinatura, cobranças ou precisar de suporte técnico, 
              nossa equipe está pronta para ajudar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                Suporte por Email
              </Button>
              <Button variant="outline">
                Central de Ajuda
              </Button>
              <Button variant="outline">
                FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

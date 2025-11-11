import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";

export function SubscriptionBanner() {
  const { user } = useAuth();
  
  const { data: subscription, isLoading } = trpc.subscription.current.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (isLoading || !subscription) return null;

  // Assinatura ativa - não mostrar banner
  if (subscription.status === 'active' && subscription.planId !== 'basic') {
    return null;
  }

  // Trial ativo - mostrar incentivo para assinar
  if (subscription.status === 'trialing') {
    return (
      <Alert className="border-blue-200 bg-blue-50 rounded-none border-x-0">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-blue-800">
            Você está no período de teste. Assine agora e continue aproveitando todos os benefícios!
          </span>
          <Link href="/pricing">
            <Button size="sm" variant="default" className="ml-4 bg-blue-600 hover:bg-blue-700">
              Ver Planos
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // Plano básico ou sem Stripe subscription
  if (subscription.planId === 'basic' || !subscription.stripeSubscriptionId) {
    return (
      <Alert className="border-purple-200 bg-purple-50 rounded-none border-x-0">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-purple-800">
            Você está no plano básico. Faça upgrade para desbloquear recursos avançados e aumentar sua produtividade!
          </span>
          <Link href="/pricing">
            <Button size="sm" className="ml-4 bg-purple-600 hover:bg-purple-700">
              Fazer Upgrade
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // Assinatura com problemas de pagamento
  if (subscription.status === 'past_due') {
    return (
      <Alert className="border-red-200 bg-red-50 rounded-none border-x-0">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-800">
            Há um problema com seu pagamento. Atualize suas informações para continuar acessando os recursos premium.
          </span>
          <Link href="/subscription">
            <Button size="sm" variant="destructive" className="ml-4">
              Atualizar Pagamento
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // Assinatura cancelada
  if (subscription.status === 'canceled') {
    return (
      <Alert className="border-gray-200 bg-gray-50 rounded-none border-x-0">
        <AlertCircle className="h-4 w-4 text-gray-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-gray-800">
            Sua assinatura foi cancelada. Reative para continuar aproveitando todos os recursos premium.
          </span>
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="ml-4">
              Reativar Assinatura
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireSubscription = false,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: subscription, isLoading: subscriptionLoading } = trpc.subscription.current.useQuery(
    undefined,
    { enabled: !!user && requireSubscription }
  );

  useEffect(() => {
    if (loading || subscriptionLoading) return;

    // Não autenticado
    if (!user) {
      setLocation("/pricing");
      return;
    }

    // Requer admin mas não é admin
    if (requireAdmin && user.role !== "admin") {
      setLocation("/dashboard");
      return;
    }

    // Requer assinatura mas não tem assinatura ativa
    if (requireSubscription && !subscription) {
      setLocation("/pricing?message=subscription_required");
      return;
    }

    // Tem assinatura mas está vencida ou cancelada
    if (requireSubscription && subscription && !["active", "trialing"].includes(subscription.status)) {
      setLocation("/pricing?message=subscription_expired");
      return;
    }
  }, [user, subscription, loading, subscriptionLoading, requireSubscription, requireAdmin, setLocation]);

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return null;
  }

  // Requer admin mas não é admin
  if (requireAdmin && user.role !== "admin") {
    return null;
  }

  // Requer assinatura mas não tem
  if (requireSubscription && !subscription) {
    return null;
  }

  // Tem assinatura mas não está ativa
  if (requireSubscription && subscription && !["active", "trialing"].includes(subscription.status)) {
    return null;
  }

  return <>{children}</>;
}

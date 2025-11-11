import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ProtectedRoute } from "./ProtectedRoute";
import { SubscriptionBanner } from "./SubscriptionBanner";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
  requireSubscription = true,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireSubscription?: boolean;
  requireAdmin?: boolean;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireSubscription={requireSubscription} requireAdmin={requireAdmin}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <SubscriptionBanner />
        <main className="flex-1 bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

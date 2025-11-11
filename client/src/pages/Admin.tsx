import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, Building2, CreditCard, TrendingUp, Activity, AlertCircle, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  if (!user || user.role !== 'admin') {
    setTimeout(() => setLocation('/dashboard'), 0);
    return <div>Redirecionando...</div>;
  }

  const { data: metrics } = trpc.admin.metrics.useQuery();
  const { data: users } = trpc.admin.users.useQuery();
  const { data: farms } = trpc.admin.farms.useQuery();
  const { data: subscriptions } = trpc.admin.subscriptions.useQuery();
  const { data: activity } = trpc.admin.activity.useQuery({ limit: 10 });

  const delinquentCount = useMemo(() => {
    return subscriptions?.filter(sub => sub.status === 'past_due').length || 0;
  }, [subscriptions]);

  return (
    <DashboardLayout requireAdmin={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gestão completa de clientes e cobranças</p>
          </div>
          <Badge className="px-4 py-2 bg-purple-50 text-purple-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            Admin Master
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Assinaturas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics?.activeSubscriptions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Inadimplentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{delinquentCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {metrics?.totalRevenue?.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users?.slice(0, 10).map((u) => (
                  <div key={u.id} className="flex justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{u.name || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge>{u.role === 'admin' ? 'Admin' : 'Usuário'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fazendas Cadastradas ({farms?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {farms?.slice(0, 10).map((f) => (
                  <div key={f.id} className="flex justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-sm text-muted-foreground">{f.region} - {f.state}</p>
                    </div>
                    <Badge variant="outline">{f.farmType}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assinaturas ({subscriptions?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">User ID</th>
                  <th className="text-left p-3">Plano</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions?.map((sub) => (
                  <tr key={sub.id} className="border-b">
                    <td className="p-3">{sub.id}</td>
                    <td className="p-3">{sub.userId}</td>
                    <td className="p-3"><Badge>{sub.planId}</Badge></td>
                    <td className="p-3"><Badge className={sub.status === 'past_due' ? 'bg-red-100' : 'bg-green-100'}>{sub.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

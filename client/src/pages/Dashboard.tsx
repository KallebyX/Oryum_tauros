import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Leaf, Target } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: farms } = trpc.farms.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const farm = farms?.[0];

  const { data: dashboardData, isLoading: dashboardLoading } = trpc.farms.dashboard.useQuery(
    { farmId: farm?.id || 0 },
    { enabled: !!farm }
  );

  const { data: subscription } = trpc.subscription.current.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (!farm) {
    setLocation("/onboarding");
    return null;
  }

  // Mock data for charts
  const financialTrendData = [
    { month: 'Jan', receita: 45000, despesa: 32000 },
    { month: 'Fev', receita: 52000, despesa: 35000 },
    { month: 'Mar', receita: 48000, despesa: 33000 },
    { month: 'Abr', receita: 61000, despesa: 38000 },
    { month: 'Mai', receita: 55000, despesa: 36000 },
    { month: 'Jun', receita: 67000, despesa: 40000 },
  ];

  const esgScoreData = [
    { name: 'Ambiental', value: 75 },
    { name: 'Social', value: 60 },
    { name: 'Governança', value: 85 },
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{farm.name}</h1>
              <p className="text-sm text-muted-foreground">{farm.region}, {farm.state}</p>
            </div>
            <div className="flex items-center gap-4">
              {!subscription && (
                <Button variant="outline" onClick={() => setLocation("/pricing")}>
                  Assinar Premium
                </Button>
              )}
              <Button variant="ghost" onClick={() => setLocation("/")}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita (30d)</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.financial.current.income ? formatCurrency(dashboardData.financial.current.income) : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {dashboardData?.financial.trend === 'up' ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">+12% vs período anterior</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-600" />
                    <span className="text-red-600">-5% vs período anterior</span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo (30d)</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.financial.current.balance ? formatCurrency(dashboardData.financial.current.balance) : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lucro líquido do período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Score ESG</CardTitle>
              <Leaf className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.esg.percentage || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData?.badge?.level === 'gold' ? '🥇 Ouro' : dashboardData?.badge?.level === 'silver' ? '🥈 Prata' : dashboardData?.badge?.level === 'bronze' ? '🥉 Bronze' : 'Sem selo'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardData?.alerts.lowStock || 0) + (dashboardData?.alerts.expiring || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData?.alerts.lowStock || 0} estoque baixo, {dashboardData?.alerts.expiring || 0} vencendo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tendência Financeira</CardTitle>
              <CardDescription>Receitas vs Despesas (últimos 6 meses)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={2} name="Receita" />
                  <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} name="Despesa" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição ESG</CardTitle>
              <CardDescription>Pontuação por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={esgScoreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {esgScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/financial")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Gerenciar transações e relatórios</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/inventory")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Controlar insumos e alertas</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/esg")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                ESG
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Avaliar práticas sustentáveis</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/challenges")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Desafios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {dashboardData?.challenges.active || 0} ativos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

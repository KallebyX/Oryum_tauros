import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Calendar,
  DollarSign,
  Leaf,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to onboarding if user doesn't have a farm
  useEffect(() => {
    if (isAuthenticated && user && !user.farmId) {
      setLocation("/onboarding");
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: kpis, isLoading } = trpc.dashboard.kpis.useQuery(
    { farmId: user?.farmId || 0 },
    { enabled: !!user?.farmId }
  );

  // Buscar metas ativas
  const { data: allGoals = [] } = trpc.goals.list.useQuery(
    { farmId: user?.farmId || 0 },
    { enabled: !!user?.farmId }
  );

  // Filtrar e ordenar as 3 metas mais próximas do prazo
  const upcomingGoals = allGoals
    .filter((g: any) => g.status === "active")
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar o dashboard</p>
          <Link href="/">
            <Button>Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock data for charts
  const financialData = [
    { month: "Jan", receitas: 45000, despesas: 32000 },
    { month: "Fev", receitas: 52000, despesas: 35000 },
    { month: "Mar", receitas: 48000, despesas: 33000 },
    { month: "Abr", receitas: 61000, despesas: 38000 },
    { month: "Mai", receitas: 55000, despesas: 36000 },
    { month: "Jun", receitas: 67000, despesas: 40000 },
  ];

  const esgScoreData = [
    { month: "Jan", score: 45 },
    { month: "Fev", score: 52 },
    { month: "Mar", score: 58 },
    { month: "Abr", score: 65 },
    { month: "Mai", score: 72 },
    { month: "Jun", score: 78 },
  ];

  const animalsByPhase = [
    { phase: "Cria", quantity: 150 },
    { phase: "Recria", quantity: 200 },
    { phase: "Engorda", quantity: 180 },
    { phase: "Lactação", quantity: 120 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container flex h-16 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Bem-vindo, {user.name}</p>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/financial">
              <Button variant="ghost">Financeiro</Button>
            </Link>
            <Link href="/inventory">
              <Button variant="ghost">Estoque</Button>
            </Link>
            <Link href="/planning">
              <Button variant="ghost">Planejamento</Button>
            </Link>
            <Link href="/esg">
              <Button variant="ghost">ESG</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Saldo do Mês
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ 0
              </div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>+12% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Score ESG
              </CardTitle>
              <Leaf className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kpis?.esgScore || 0}
              </div>
              <div className="flex items-center text-sm text-emerald-600 mt-1">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>
                  {kpis?.esgScore && kpis.esgScore >= 90 ? "Selo Ouro" : 
                   kpis?.esgScore && kpis.esgScore >= 60 ? "Selo Prata" : 
                   kpis?.esgScore && kpis.esgScore >= 30 ? "Selo Bronze" : "Sem Selo"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Animais Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kpis?.activeAnimals || 0}
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Em monitoramento</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Alertas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                0
              </div>
              <div className="flex items-center text-sm text-orange-600 mt-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Itens com estoque baixo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Financial Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Desempenho Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="receitas" 
                    stackId="1"
                    stroke="#16a34a" 
                    fill="#16a34a" 
                    fillOpacity={0.6}
                    name="Receitas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="despesas" 
                    stackId="2"
                    stroke="#dc2626" 
                    fill="#dc2626" 
                    fillOpacity={0.6}
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ESG Score Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                Evolução Score ESG
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={esgScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Score ESG"
                    dot={{ fill: '#10b981', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Animals by Phase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Animais por Fase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={animalsByPhase}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#3b82f6" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Tarefas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis?.pendingTasks && kpis.pendingTasks > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Vacinação Lote A</p>
                          <p className="text-sm text-gray-600">Vence em 3 dias</p>
                        </div>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Alta</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Pesagem Mensal</p>
                          <p className="text-sm text-gray-600">Vence em 5 dias</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Média</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Manutenção de Cercas</p>
                          <p className="text-sm text-gray-600">Vence em 7 dias</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Baixa</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma tarefa pendente</p>
                  </div>
                )}
                <Link href="/planning">
                  <Button variant="outline" className="w-full">
                    Ver Todas as Tarefas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metas Próximas */}
        {upcomingGoals.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Metas em Andamento</h2>
              <Link href="/goals">
                <Button variant="outline" size="sm">
                  Ver Todas
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingGoals.map((goal: any) => {
                const progress = Math.min(
                  (parseFloat(goal.currentValue || "0") / parseFloat(goal.targetValue || "1")) * 100,
                  100
                );
                const daysLeft = Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Card key={goal.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-base">{goal.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progresso</span>
                          <span className="font-semibold">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 pt-1">
                          <span>
                            {parseFloat(goal.currentValue || "0").toFixed(1)} / {parseFloat(goal.targetValue || "0").toFixed(1)} {goal.unit}
                          </span>
                          <span>
                            {daysLeft > 0 ? `${daysLeft}d restantes` : "Vencido"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/financial">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Nova Transação</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inventory">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Atualizar Estoque</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/planning">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">Agendar Tarefa</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/esg">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Leaf className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                  <p className="font-medium">Checklist ESG</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

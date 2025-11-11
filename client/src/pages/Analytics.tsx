import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";

type PeriodType = "monthly" | "annual";

export default function Analytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodType>("monthly");
  
  const farmId = user?.farmId || 1;

  // Buscar dados
  const { data: animals } = trpc.batches.listAnimals.useQuery({ farmId });
  const { data: milkProduction } = trpc.milk.list.useQuery({ farmId });
  const { data: transactions } = trpc.financial.list.useQuery({ farmId });
  const { data: esgBadges } = trpc.esg.badges.useQuery({ farmId });
  const esgScore = esgBadges && esgBadges.length > 0 ? esgBadges[0].score : 0;

  // Preparar dados para gráficos
  const gmdData = animals?.slice(0, 10).map((animal, index) => ({
    name: animal.tagId,
    gmd: animal.gmd || 0,
    peso: animal.currentWeight || 0,
  })) || [];

  const milkData = milkProduction?.slice(0, 12).reduce((acc: any[], prod) => {
    const date = new Date(prod.date || Date.now());
    const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    const existing = acc.find(item => item.month === monthKey);
    if (existing) {
      existing.litros += prod.liters || 0;
    } else {
      acc.push({ month: monthKey, litros: prod.liters || 0 });
    }
    return acc;
  }, []) || [];

  const financialData = transactions?.slice(0, 12).reduce((acc: any[], trans: any) => {
    const date = new Date(trans.date || Date.now());
    const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    const existing = acc.find(item => item.month === monthKey);
    if (existing) {
      if (trans.type === 'income') {
        existing.receitas += trans.amount || 0;
      } else {
        existing.despesas += trans.amount || 0;
      }
    } else {
      acc.push({
        month: monthKey,
        receitas: trans.type === 'income' ? trans.amount || 0 : 0,
        despesas: trans.type === 'expense' ? trans.amount || 0 : 0,
      });
    }
    return acc;
  }, []) || [];

  // Dados simulados de evolução ESG (em produção, buscar histórico real)
  const esgData = [
    { month: '1/2025', score: 45 },
    { month: '2/2025', score: 52 },
    { month: '3/2025', score: 58 },
    { month: '4/2025', score: 65 },
    { month: '5/2025', score: 70 },
    { month: '6/2025', score: esgScore || 75 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Avançado</h1>
            <p className="text-gray-600 mt-2">Análise detalhada de desempenho e tendências</p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={(value) => setPeriod(value as PeriodType)}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">GMD Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {animals && animals.length > 0
                  ? (animals.reduce((sum, a) => sum + (a.gmd || 0), 0) / animals.length).toFixed(2)
                  : '0.00'} kg/dia
              </div>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Produção de Leite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {milkProduction?.reduce((sum, p) => sum + (p.liters || 0), 0).toFixed(0) || '0'} L
              </div>
              <div className="flex items-center text-sm text-blue-600 mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {transactions
                  ? transactions.reduce((sum: number, t: any) => sum + (t.type === 'income' ? t.amount : -t.amount), 0).toFixed(2)
                  : '0.00'}
              </div>
              <div className="flex items-center text-sm text-red-600 mt-2">
                <TrendingDown className="h-4 w-4 mr-1" />
                -5% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Score ESG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {esgScore || 0}%
              </div>
              <div className="flex items-center text-sm text-purple-600 mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                +15% vs mês anterior
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de GMD */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de GMD por Animal</CardTitle>
              <CardDescription>Ganho Médio Diário dos principais animais</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gmdData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="gmd" stroke="#10b981" strokeWidth={2} name="GMD (kg/dia)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Produção de Leite */}
          <Card>
            <CardHeader>
              <CardTitle>Produção de Leite Mensal</CardTitle>
              <CardDescription>Volume total produzido por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={milkData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="litros" fill="#3b82f6" name="Litros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
              <CardDescription>Comparativo mensal de fluxo de caixa</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} name="Receitas" />
                  <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de ESG */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Score ESG</CardTitle>
              <CardDescription>Progresso de sustentabilidade ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={esgData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Score ESG (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

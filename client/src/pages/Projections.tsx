import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { TrendingUp, Calculator, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Projections() {
  const { user } = useAuth();
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    baseRevenue: "",
    baseVolume: "",
    fixedCosts: "",
    variableCostPerUnit: "",
    months: "12",
  });

  const { data: projections, refetch } = trpc.projections.list.useQuery(
    user?.farmId ? { farmId: user.farmId } : skipToken
  );

  const { data: comparison, refetch: refetchComparison } = trpc.projections.compare.useQuery(
    calculatorData.baseRevenue && calculatorData.baseVolume && calculatorData.fixedCosts && calculatorData.variableCostPerUnit
      ? {
          baseRevenue: parseFloat(calculatorData.baseRevenue),
          baseVolume: parseInt(calculatorData.baseVolume),
          fixedCosts: parseFloat(calculatorData.fixedCosts),
          variableCostPerUnit: parseFloat(calculatorData.variableCostPerUnit),
          months: parseInt(calculatorData.months),
        }
      : skipToken,
    { enabled: false }
  );

  const handleCalculate = async () => {
    if (!calculatorData.baseRevenue || !calculatorData.baseVolume || !calculatorData.fixedCosts || !calculatorData.variableCostPerUnit) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await refetchComparison();
      toast.success("Projeções calculadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao calcular projeções");
    }
  };

  const saveProjection = trpc.projections.create.useMutation({
    onSuccess: () => {
      toast.success("Projeção salva com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar projeção: ${error.message}`);
    },
  });

  const handleSaveScenario = (scenario: 'optimistic' | 'realistic' | 'pessimistic') => {
    if (!user?.farmId || !comparison) return;

    const scenarioData = comparison.find(c => c.scenario === scenario);
    if (!scenarioData) return;

    const scenarioNames = {
      optimistic: 'Cenário Otimista',
      realistic: 'Cenário Realista',
      pessimistic: 'Cenário Pessimista',
    };

    const growthRates = {
      optimistic: 5,
      realistic: 2,
      pessimistic: -1,
    };

    saveProjection.mutate({
      farmId: user.farmId,
      name: `${scenarioNames[scenario]} - ${new Date().toLocaleDateString('pt-BR')}`,
      description: `Projeção de ${calculatorData.months} meses`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + parseInt(calculatorData.months) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scenario,
      revenueGrowthRate: growthRates[scenario],
      averagePrice: parseFloat(calculatorData.baseRevenue) / parseInt(calculatorData.baseVolume),
      expectedVolume: parseInt(calculatorData.baseVolume),
      fixedCosts: parseFloat(calculatorData.fixedCosts),
      variableCostPerUnit: parseFloat(calculatorData.variableCostPerUnit),
      operatingExpenseRate: scenario === 'optimistic' ? 15 : scenario === 'realistic' ? 20 : 25,
      projectedRevenue: scenarioData.summary.finalRevenue,
      projectedCosts: scenarioData.summary.totalCosts,
      projectedProfit: scenarioData.summary.finalProfit,
      profitMargin: scenarioData.summary.finalMargin,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return 'text-green-600';
      case 'realistic': return 'text-blue-600';
      case 'pessimistic': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getScenarioLabel = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return 'Otimista';
      case 'realistic': return 'Realista';
      case 'pessimistic': return 'Pessimista';
      default: return scenario;
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Projeções Financeiras
            </h1>
            <p className="text-muted-foreground mt-1">
              Calcule cenários futuros e planeje o crescimento da fazenda
            </p>
          </div>
          <Button onClick={() => setShowCalculator(!showCalculator)}>
            <Calculator className="w-4 h-4 mr-2" />
            {showCalculator ? 'Ocultar' : 'Nova Projeção'}
          </Button>
        </div>

        {/* Calculadora de Projeções */}
        {showCalculator && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Calculadora de Cenários</CardTitle>
              <CardDescription>
                Insira os dados base e calcule projeções para 3 cenários diferentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Receita Base Mensal *</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 50000"
                    value={calculatorData.baseRevenue}
                    onChange={(e) => setCalculatorData({ ...calculatorData, baseRevenue: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Volume Base Mensal *</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 100"
                    value={calculatorData.baseVolume}
                    onChange={(e) => setCalculatorData({ ...calculatorData, baseVolume: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Unidades vendidas/mês</p>
                </div>
                <div>
                  <Label>Custos Fixos Mensais *</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 15000"
                    value={calculatorData.fixedCosts}
                    onChange={(e) => setCalculatorData({ ...calculatorData, fixedCosts: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Custo Variável por Unidade *</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 200"
                    value={calculatorData.variableCostPerUnit}
                    onChange={(e) => setCalculatorData({ ...calculatorData, variableCostPerUnit: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Período de Projeção (meses)</Label>
                  <Select value={calculatorData.months} onValueChange={(value) => setCalculatorData({ ...calculatorData, months: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="24">24 meses</SelectItem>
                      <SelectItem value="36">36 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCalculate} className="w-full">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calcular Cenários
                  </Button>
                </div>
              </div>

              {/* Premissas dos Cenários */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-3">Premissas por Cenário:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-600">🚀 Otimista</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Crescimento: +5% ao mês</li>
                      <li>• Despesas operacionais: 15%</li>
                      <li>• Condições favoráveis</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-600">📊 Realista</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Crescimento: +2% ao mês</li>
                      <li>• Despesas operacionais: 20%</li>
                      <li>• Condições normais</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-orange-600">⚠️ Pessimista</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Crescimento: -1% ao mês</li>
                      <li>• Despesas operacionais: 25%</li>
                      <li>• Condições adversas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparação de Cenários */}
        {comparison && comparison.length > 0 && (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {comparison.map((scenario) => (
                <Card key={scenario.scenario}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg ${getScenarioColor(scenario.scenario)}`}>
                      {getScenarioLabel(scenario.scenario)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Total</p>
                        <p className="text-xl font-bold">{formatCurrency(scenario.summary.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lucro Total</p>
                        <p className={`text-xl font-bold ${scenario.summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(scenario.summary.totalProfit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Margem Final</p>
                        <p className="text-lg font-semibold">{scenario.summary.finalMargin.toFixed(2)}%</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleSaveScenario(scenario.scenario as 'optimistic' | 'realistic' | 'pessimistic')}
                      >
                        Salvar este Cenário
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gráfico de Receita por Cenário */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5" />
                  Evolução da Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      type="number"
                      domain={[1, parseInt(calculatorData.months)]}
                      label={{ value: 'Mês', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Receita (R$)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Mês ${label}`}
                    />
                    <Legend />
                    <Line 
                      data={comparison.find(c => c.scenario === 'optimistic')?.projections}
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#16a34a" 
                      name="Otimista"
                      strokeWidth={2}
                    />
                    <Line 
                      data={comparison.find(c => c.scenario === 'realistic')?.projections}
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563eb" 
                      name="Realista"
                      strokeWidth={2}
                    />
                    <Line 
                      data={comparison.find(c => c.scenario === 'pessimistic')?.projections}
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#ea580c" 
                      name="Pessimista"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Lucro por Cenário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Comparação de Lucro Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparison.map(c => ({
                    scenario: getScenarioLabel(c.scenario),
                    lucro: c.summary.totalProfit,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="lucro" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* Projeções Salvas */}
        {projections && projections.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Projeções Salvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projections.map((proj) => (
                  <div key={proj.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{proj.name}</p>
                      <p className="text-sm text-muted-foreground">{proj.description || 'Sem descrição'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(proj.startDate).toLocaleDateString('pt-BR')} até {new Date(proj.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getScenarioColor(proj.scenario)}`}>
                        {getScenarioLabel(proj.scenario)}
                      </p>
                      <p className="text-lg font-bold">{formatCurrency(parseFloat(proj.projectedProfit))}</p>
                      <p className="text-xs text-muted-foreground">Margem: {parseFloat(proj.profitMargin).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

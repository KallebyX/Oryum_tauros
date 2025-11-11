import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { TrendingDown, Calculator, AlertCircle, Target } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

export default function BreakEven() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fixedCosts: "",
    variableCostPerUnit: "",
    unitPrice: "",
    currentUnits: "",
  });

  const { data: analysis, refetch } = trpc.breakeven.analyze.useQuery(
    user?.farmId && formData.fixedCosts && formData.variableCostPerUnit && formData.unitPrice && formData.currentUnits
      ? {
          farmId: user.farmId,
          fixedCosts: parseFloat(formData.fixedCosts),
          variableCostPerUnit: parseFloat(formData.variableCostPerUnit),
          unitPrice: parseFloat(formData.unitPrice),
          currentUnits: parseInt(formData.currentUnits),
        }
      : skipToken,
    { enabled: false }
  );

  const handleCalculate = async () => {
    if (!formData.fixedCosts || !formData.variableCostPerUnit || !formData.unitPrice || !formData.currentUnits) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await refetch();
      toast.success("Análise calculada com sucesso!");
    } catch (error) {
      toast.error("Erro ao calcular análise");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="w-8 h-8 text-purple-600" />
              Análise de Ponto de Equilíbrio
            </h1>
            <p className="text-muted-foreground mt-1">
              Calcule o break-even point e analise a viabilidade do negócio
            </p>
          </div>
        </div>

        {/* Formulário de Entrada */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Calculadora de Break-Even</CardTitle>
            <CardDescription>
              Informe os dados da sua operação para calcular o ponto de equilíbrio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Custos Fixos Mensais *</Label>
                <Input
                  type="number"
                  placeholder="Ex: 25000"
                  value={formData.fixedCosts}
                  onChange={(e) => setFormData({ ...formData, fixedCosts: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Aluguel, salários, etc.</p>
              </div>
              <div>
                <Label>Custo Variável por Unidade *</Label>
                <Input
                  type="number"
                  placeholder="Ex: 150"
                  value={formData.variableCostPerUnit}
                  onChange={(e) => setFormData({ ...formData, variableCostPerUnit: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Insumos, ração, etc.</p>
              </div>
              <div>
                <Label>Preço de Venda (Unitário) *</Label>
                <Input
                  type="number"
                  placeholder="Ex: 500"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Preço por animal/unidade</p>
              </div>
              <div>
                <Label>Volume Atual (unidades/mês) *</Label>
                <Input
                  type="number"
                  placeholder="Ex: 100"
                  value={formData.currentUnits}
                  onChange={(e) => setFormData({ ...formData, currentUnits: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Vendas mensais</p>
              </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Ponto de Equilíbrio
            </Button>
          </CardContent>
        </Card>

        {/* Resultados da Análise */}
        {analysis && (
          <>
            {/* Cards Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ponto de Equilíbrio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(analysis.baseAnalysis.breakEvenUnits)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">unidades/mês</p>
                  <div className="text-lg font-semibold mt-2">
                    {formatCurrency(analysis.baseAnalysis.breakEvenRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Margem de Contribuição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(analysis.baseAnalysis.contributionMargin)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">por unidade</p>
                  <div className="text-lg font-semibold mt-2">
                    {analysis.baseAnalysis.contributionMarginRatio.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Margem de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${analysis.baseAnalysis.marginOfSafety >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(analysis.baseAnalysis.marginOfSafety)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">acima do break-even</p>
                  <div className="text-lg font-semibold mt-2">
                    {analysis.baseAnalysis.marginOfSafetyPercentage.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Lucro Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${analysis.baseAnalysis.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(analysis.baseAnalysis.currentProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">mensal</p>
                  <div className="text-sm font-medium mt-2">
                    {formatNumber(analysis.baseAnalysis.currentUnits)} unidades/mês
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interpretação */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Interpretação dos Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold mb-1">📊 Ponto de Equilíbrio:</p>
                    <p>
                      Você precisa vender <strong>{formatNumber(analysis.baseAnalysis.breakEvenUnits)} unidades</strong> por mês 
                      (ou faturar <strong>{formatCurrency(analysis.baseAnalysis.breakEvenRevenue)}</strong>) para cobrir todos os custos.
                      {analysis.baseAnalysis.currentUnits >= analysis.baseAnalysis.breakEvenUnits ? (
                        <span className="text-green-600 font-medium"> ✓ Você está acima do ponto de equilíbrio!</span>
                      ) : (
                        <span className="text-red-600 font-medium"> ⚠ Você está abaixo do ponto de equilíbrio.</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold mb-1">💰 Margem de Contribuição:</p>
                    <p>
                      Cada unidade vendida contribui com <strong>{formatCurrency(analysis.baseAnalysis.contributionMargin)}</strong> para 
                      cobrir os custos fixos e gerar lucro. Isso representa <strong>{analysis.baseAnalysis.contributionMarginRatio.toFixed(1)}%</strong> do 
                      preço de venda.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold mb-1">🛡️ Margem de Segurança:</p>
                    <p>
                      Suas vendas atuais estão <strong>{formatCurrency(Math.abs(analysis.baseAnalysis.marginOfSafety))}</strong>
                      {analysis.baseAnalysis.marginOfSafety >= 0 ? ' acima' : ' abaixo'} do ponto de equilíbrio 
                      (<strong>{Math.abs(analysis.baseAnalysis.marginOfSafetyPercentage).toFixed(1)}%</strong>).
                      {analysis.baseAnalysis.marginOfSafetyPercentage > 30 && ' Excelente! Margem confortável.'}
                      {analysis.baseAnalysis.marginOfSafetyPercentage > 15 && analysis.baseAnalysis.marginOfSafetyPercentage <= 30 && ' Boa margem de segurança.'}
                      {analysis.baseAnalysis.marginOfSafetyPercentage > 0 && analysis.baseAnalysis.marginOfSafetyPercentage <= 15 && ' Margem pequena, fique atento.'}
                      {analysis.baseAnalysis.marginOfSafetyPercentage <= 0 && ' Operando com prejuízo!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Sensibilidade de Volume */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Análise de Sensibilidade - Impacto do Volume no Lucro</CardTitle>
                <CardDescription>Como variações no volume de vendas afetam o resultado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysis.volumeScenarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="volumePercentage" 
                      label={{ value: '% do Volume Atual', position: 'insideBottom', offset: -5 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      label={{ value: 'Lucro (R$)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `${label}% do volume`}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" label="Break-Even" />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#8b5cf6" 
                      name="Lucro"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análise de Cenários de Preço */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Impacto da Variação de Preços</CardTitle>
                <CardDescription>Como mudanças no preço afetam o ponto de equilíbrio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.priceAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip 
                      formatter={(value: number) => `${formatNumber(value)} unidades`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="analysis.breakEvenUnits" 
                      fill="#3b82f6" 
                      name="Unidades para Break-Even"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysis.priceAnalysis.map((scenario, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{scenario.label}</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatNumber(scenario.analysis.breakEvenUnits)}
                      </p>
                      <p className="text-xs text-muted-foreground">unidades</p>
                      <p className="text-sm mt-1">{formatCurrency(scenario.unitPrice)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Análise de Cenários de Custos */}
            <Card>
              <CardHeader>
                <CardTitle>Impacto da Variação de Custos Variáveis</CardTitle>
                <CardDescription>Como mudanças nos custos afetam o ponto de equilíbrio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.costAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip 
                      formatter={(value: number) => `${formatNumber(value)} unidades`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="analysis.breakEvenUnits" 
                      fill="#f59e0b" 
                      name="Unidades para Break-Even"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysis.costAnalysis.map((scenario, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{scenario.label}</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatNumber(scenario.analysis.breakEvenUnits)}
                      </p>
                      <p className="text-xs text-muted-foreground">unidades</p>
                      <p className="text-sm mt-1">{formatCurrency(scenario.variableCostPerUnit)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

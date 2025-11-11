import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ComparisonCard } from "@/components/ComparisonCard";
import { trpc } from "@/lib/trpc";
import { TrendingDown, TrendingUp, DollarSign, Target, Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Budget() {
  const { user } = useAuth();
  const farmId = user?.farmId || 0;
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    month: currentMonth,
    category: "revenue" as "revenue" | "expense",
    subcategory: "",
    plannedAmount: "",
    notes: "",
  });

  const { data: budgets, refetch } = trpc.budget.list.useQuery({ farmId, year: selectedYear });
  const { data: summary } = trpc.budget.summary.useQuery({ farmId, year: selectedYear });
  const { data: monthComparison } = trpc.comparison.monthOverMonth.useQuery(
    farmId ? { farmId, year: currentYear, month: currentMonth } : { farmId: 0, year: 0, month: 0 },
    { enabled: !!farmId }
  );
  
  const createMutation = trpc.budget.create.useMutation();
  const updateMutation = trpc.budget.update.useMutation();
  const deleteMutation = trpc.budget.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subcategory || !formData.plannedAmount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingBudget) {
        await updateMutation.mutateAsync({
          id: editingBudget.id,
          plannedAmount: parseFloat(formData.plannedAmount),
          notes: formData.notes,
        });
        toast.success("Orçamento atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync({
          farmId,
          year: selectedYear,
          month: formData.month,
          category: formData.category,
          subcategory: formData.subcategory,
          plannedAmount: parseFloat(formData.plannedAmount),
          notes: formData.notes || undefined,
        });
        toast.success("Orçamento criado com sucesso!");
      }

      setIsOpen(false);
      setEditingBudget(null);
      setFormData({
        month: new Date().getMonth() + 1,
        category: "revenue",
        subcategory: "",
        plannedAmount: "",
        notes: "",
      });
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar orçamento");
    }
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setFormData({
      month: budget.month,
      category: budget.category,
      subcategory: budget.subcategory,
      plannedAmount: budget.plannedAmount,
      notes: budget.notes || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este orçamento?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Orçamento excluído com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir orçamento");
    }
  };

  // Preparar dados para gráfico mensal
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthBudgets = budgets?.filter(b => b.month === month) || [];
    
    const plannedRevenue = monthBudgets
      .filter(b => b.category === 'revenue')
      .reduce((sum, b) => sum + parseFloat(b.plannedAmount), 0);
    
    const actualRevenue = monthBudgets
      .filter(b => b.category === 'revenue')
      .reduce((sum, b) => sum + parseFloat(b.actualAmount), 0);
    
    const plannedExpense = monthBudgets
      .filter(b => b.category === 'expense')
      .reduce((sum, b) => sum + parseFloat(b.plannedAmount), 0);
    
    const actualExpense = monthBudgets
      .filter(b => b.category === 'expense')
      .reduce((sum, b) => sum + parseFloat(b.actualAmount), 0);
    
    return {
      month: new Date(2000, i).toLocaleString('pt-BR', { month: 'short' }),
      plannedRevenue,
      actualRevenue,
      plannedExpense,
      actualExpense,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('pt-BR', { month: 'long' });
  };

  const variancePercentage = summary?.plannedBalance !== 0
    ? ((summary?.variance || 0) / Math.abs(summary?.plannedBalance || 1)) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Planejamento Financeiro</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie orçamentos, projeções e análise de desempenho financeiro
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isOpen} onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                setEditingBudget(null);
                setFormData({
                  month: new Date().getMonth() + 1,
                  category: "revenue",
                  subcategory: "",
                  plannedAmount: "",
                  notes: "",
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Orçamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBudget ? "Editar" : "Criar"} Orçamento</DialogTitle>
                  <DialogDescription>
                    {editingBudget ? "Atualize" : "Configure"} um orçamento para acompanhar seu planejamento
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="month">Mês</Label>
                      <Select
                        value={formData.month.toString()}
                        onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                        disabled={!!editingBudget}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {getMonthName(month)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: typeof formData.category) => setFormData({ ...formData, category: value })}
                        disabled={!!editingBudget}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategoria</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="Ex: Venda de animais, Ração, Medicamentos..."
                      disabled={!!editingBudget}
                    />
                  </div>

                  <div>
                    <Label htmlFor="plannedAmount">Valor Planejado (R$)</Label>
                    <Input
                      id="plannedAmount"
                      type="number"
                      step="0.01"
                      value={formData.plannedAmount}
                      onChange={(e) => setFormData({ ...formData, plannedAmount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notas adicionais (opcional)"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingBudget ? "Atualizar" : "Criar"} Orçamento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Receita Planejada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.totalPlannedRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real: {formatCurrency(summary?.totalActualRevenue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Despesa Planejada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary?.totalPlannedExpense || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real: {formatCurrency(summary?.totalActualExpense || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Saldo Planejado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary?.plannedBalance || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real: {formatCurrency(summary?.actualBalance || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Variação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(summary?.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.variance || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {variancePercentage.toFixed(1)}% do planejado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas - Planejado vs Real</CardTitle>
              <CardDescription>Comparação mensal de valores planejados e realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="plannedRevenue" fill="#10b981" name="Receita Planejada" />
                  <Bar dataKey="actualRevenue" fill="#059669" name="Receita Real" />
                  <Bar dataKey="plannedExpense" fill="#ef4444" name="Despesa Planejada" />
                  <Bar dataKey="actualExpense" fill="#dc2626" name="Despesa Real" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução do Saldo</CardTitle>
              <CardDescription>Saldo acumulado ao longo do ano</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData.map((d, i) => ({
                  ...d,
                  plannedBalance: monthlyData.slice(0, i + 1).reduce((sum, m) => sum + m.plannedRevenue - m.plannedExpense, 0),
                  actualBalance: monthlyData.slice(0, i + 1).reduce((sum, m) => sum + m.actualRevenue - m.actualExpense, 0),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="plannedBalance" stroke="#3b82f6" name="Saldo Planejado" strokeWidth={2} />
                  <Line type="monotone" dataKey="actualBalance" stroke="#8b5cf6" name="Saldo Real" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Orçamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos Detalhados - {selectedYear}</CardTitle>
            <CardDescription>
              Lista completa de todos os orçamentos configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!budgets || budgets.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum orçamento configurado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie seu primeiro orçamento para começar o planejamento
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Mês</th>
                      <th className="text-left p-3">Categoria</th>
                      <th className="text-left p-3">Subcategoria</th>
                      <th className="text-right p-3">Planejado</th>
                      <th className="text-right p-3">Real</th>
                      <th className="text-right p-3">Variação</th>
                      <th className="text-right p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((budget) => {
                      const planned = parseFloat(budget.plannedAmount);
                      const actual = parseFloat(budget.actualAmount);
                      const variance = actual - planned;
                      const isPositive = budget.category === 'revenue' ? variance >= 0 : variance <= 0;

                      return (
                        <tr key={budget.id} className="border-b hover:bg-accent/50">
                          <td className="p-3">{getMonthName(budget.month)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              budget.category === 'revenue' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {budget.category === 'revenue' ? 'Receita' : 'Despesa'}
                            </span>
                          </td>
                          <td className="p-3">{budget.subcategory}</td>
                          <td className="text-right p-3 font-medium">{formatCurrency(planned)}</td>
                          <td className="text-right p-3">{formatCurrency(actual)}</td>
                          <td className={`text-right p-3 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(variance))} {isPositive ? '✓' : '✗'}
                          </td>
                          <td className="text-right p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(budget)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(budget.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

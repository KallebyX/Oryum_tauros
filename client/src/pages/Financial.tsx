import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, Plus, FileDown } from "lucide-react";
import { useExcelExport } from "@/hooks/useExcelExport";
import { ComparisonCard } from "@/components/ComparisonCard";
import { toast } from "sonner";

export default function Financial() {
  const { user } = useAuth();
  const { exportToExcel } = useExcelExport();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { data: transactions, refetch } = trpc.financial.list.useQuery(user?.farmId ? { farmId: user.farmId } : skipToken);
  const { data: exportData, refetch: refetchExport } = trpc.exports.financial.useQuery(
    user?.farmId ? { farmId: user.farmId } : skipToken,
    { enabled: false }
  );
  
  const { data: monthComparison } = trpc.comparison.monthOverMonth.useQuery(
    user?.farmId ? { farmId: user.farmId, year: currentYear, month: currentMonth } : skipToken
  );
  
  const createTransaction = trpc.financial.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({ type: "income", category: "", amount: "", description: "", date: new Date().toISOString().split('T')[0] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.farmId) return;
    createTransaction.mutate({
      farmId: user.farmId,
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
    });
  };

  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
  const balance = totalIncome - totalExpense;

  const handleExport = async () => {
    try {
      const result = await refetchExport();
      if (result.data && result.data.length > 0) {
        const success = exportToExcel(result.data, `transacoes-financeiras-${new Date().toISOString().split('T')[0]}`, 'Transações');
        if (success) {
          toast.success('Relatório exportado com sucesso!');
        } else {
          toast.error('Erro ao exportar relatório');
        }
      } else {
        toast.warning('Nenhum dado disponível para exportar');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Receitas</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalIncome.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Despesas</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {totalExpense.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {balance.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparação Mês-a-Mês */}
        {monthComparison && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <ComparisonCard
              title="Receitas"
              currentValue={monthComparison.current.revenue}
              previousValue={monthComparison.previous.revenue}
              currentPeriod={monthComparison.current.period}
              previousPeriod={monthComparison.previous.period}
              formatValue={(v) => `R$ ${v.toLocaleString('pt-BR')}`}
            />
            <ComparisonCard
              title="Despesas"
              currentValue={monthComparison.current.expenses}
              previousValue={monthComparison.previous.expenses}
              currentPeriod={monthComparison.current.period}
              previousPeriod={monthComparison.previous.period}
              formatValue={(v) => `R$ ${v.toLocaleString('pt-BR')}`}
              inverse
            />
            <ComparisonCard
              title="Lucro"
              currentValue={monthComparison.current.profit}
              previousValue={monthComparison.previous.profit}
              currentPeriod={monthComparison.current.period}
              previousPeriod={monthComparison.previous.period}
              formatValue={(v) => `R$ ${v.toLocaleString('pt-BR')}`}
            />
          </div>
        )}

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$) *</Label>
                    <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createTransaction.isPending}>Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions?.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    {t.type === 'income' ? (
                      <ArrowUpCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="h-8 w-8 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{t.category}</p>
                      <p className="text-sm text-gray-600">{t.description || 'Sem descrição'}</p>
                      <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
              {!transactions || transactions.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nenhuma transação registrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

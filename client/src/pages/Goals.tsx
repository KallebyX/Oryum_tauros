import { useState } from "react";
import { Plus, Target, TrendingUp, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Goals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "milk_production" as const,
    title: "",
    targetValue: "",
    unit: "",
    deadline: "",
  });

  const utils = trpc.useUtils();
  
  // Assumindo farmId = 1 para demo
  const farmId = 1;

  const { data: goals = [] } = trpc.goals.list.useQuery({ farmId });

  const createGoalMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      setIsDialogOpen(false);
      setFormData({
        type: "milk_production",
        title: "",
        targetValue: "",
        unit: "",
        deadline: "",
      });
      toast.success("Meta criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar meta: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetValue || !formData.unit || !formData.deadline) {
      toast.error("Preencha todos os campos");
      return;
    }

    createGoalMutation.mutate({
      farmId,
      type: formData.type,
      title: formData.title,
      targetValue: parseFloat(formData.targetValue),
      unit: formData.unit,
      deadline: formData.deadline,
    });
  };

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      milk_production: "Produção de Leite",
      gmd: "GMD (Ganho Médio Diário)",
      esg_score: "Score ESG",
      revenue: "Receita",
      expense_reduction: "Redução de Despesas",
    };
    return labels[type] || type;
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case "milk_production":
        return "🥛";
      case "gmd":
        return "📈";
      case "esg_score":
        return "🌱";
      case "revenue":
        return "💰";
      case "expense_reduction":
        return "💸";
      default:
        return "🎯";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "failed":
        return "Falhou";
      default:
        return "Ativa";
    }
  };

  const activeGoals = goals.filter((g: any) => g.status === "active");
  const completedGoals = goals.filter((g: any) => g.status === "completed");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Metas e KPIs
              </h1>
              <p className="text-gray-600">
                Defina e acompanhe suas metas de produção e desempenho
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Nova Meta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="type">Tipo de Meta</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milk_production">
                          Produção de Leite
                        </SelectItem>
                        <SelectItem value="gmd">GMD</SelectItem>
                        <SelectItem value="esg_score">Score ESG</SelectItem>
                        <SelectItem value="revenue">Receita</SelectItem>
                        <SelectItem value="expense_reduction">
                          Redução de Despesas
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Título da Meta</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ex: Aumentar produção de leite"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetValue">Valor Alvo</Label>
                      <Input
                        id="targetValue"
                        type="number"
                        step="0.01"
                        value={formData.targetValue}
                        onChange={(e) =>
                          setFormData({ ...formData, targetValue: e.target.value })
                        }
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unidade</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        placeholder="litros"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deadline">Prazo</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createGoalMutation.isPending}
                  >
                    {createGoalMutation.isPending ? "Criando..." : "Criar Meta"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Metas Ativas</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activeGoals.length}
                  </p>
                </div>
                <Target className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídas</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">
                    {completedGoals.length}
                  </p>
                </div>
                <Award className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {goals.length > 0
                      ? Math.round((completedGoals.length / goals.length) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Metas</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {goals.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 md:h-10 md:w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metas Ativas */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            Metas Ativas
          </h2>
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="p-8 md:p-12 text-center">
                <Target className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 opacity-20" />
                <p className="text-gray-500">
                  Nenhuma meta ativa. Crie sua primeira meta!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {activeGoals.map((goal: any) => {
                const progress = Math.min(
                  (parseFloat(goal.currentValue) / parseFloat(goal.targetValue)) * 100,
                  100
                );
                const daysLeft = Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl md:text-4xl">
                            {getGoalTypeIcon(goal.type)}
                          </span>
                          <div>
                            <CardTitle className="text-base md:text-lg">
                              {goal.title}
                            </CardTitle>
                            <p className="text-xs md:text-sm text-gray-500">
                              {getGoalTypeLabel(goal.type)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(goal.status)}>
                          {getStatusLabel(goal.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progresso</span>
                            <span className="font-semibold">
                              {parseFloat(goal.currentValue).toFixed(1)} /{" "}
                              {parseFloat(goal.targetValue).toFixed(1)} {goal.unit}
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          <p className="text-xs text-gray-500 mt-1">
                            {progress.toFixed(1)}% concluído
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {daysLeft > 0
                                ? `${daysLeft} dias restantes`
                                : "Prazo vencido"}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Metas Concluídas */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Metas Concluídas
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {completedGoals.map((goal: any) => (
                <Card
                  key={goal.id}
                  className="opacity-75 hover:opacity-100 transition-opacity"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl md:text-4xl">
                          {getGoalTypeIcon(goal.type)}
                        </span>
                        <div>
                          <CardTitle className="text-base md:text-lg">
                            {goal.title}
                          </CardTitle>
                          <p className="text-xs md:text-sm text-gray-500">
                            {getGoalTypeLabel(goal.type)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">✓ Concluída</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Resultado</span>
                        <span className="font-semibold text-green-600">
                          {parseFloat(goal.currentValue).toFixed(1)} {goal.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Meta</span>
                        <span>
                          {parseFloat(goal.targetValue).toFixed(1)} {goal.unit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

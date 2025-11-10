import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { AlertCircle, Calendar, CheckCircle, Clock, Plus } from "lucide-react";

export default function Planning() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all");
  const [formData, setFormData] = useState({
    title: "",
    category: "vaccination" as "vaccination" | "reproduction" | "maintenance" | "feeding" | "other",
    dueDate: new Date().toISOString().split('T')[0],
    priority: "medium" as "low" | "medium" | "high",
    description: "",
  });

  const { data: tasks, refetch } = trpc.planning.list.useQuery(user?.farmId ? { farmId: user.farmId } : skipToken);
  const createTask = trpc.planning.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({ title: "", category: "vaccination", dueDate: new Date().toISOString().split('T')[0], priority: "medium", description: "" });
    },
  });

  const toggleTask = trpc.planning.toggleComplete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.farmId) return;
    createTask.mutate({
      farmId: user.farmId,
      title: formData.title,
      category: formData.category,
      dueDate: formData.dueDate,
      priority: formData.priority,
      description: formData.description,
    });
  };

  const filteredTasks = tasks?.filter(task => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "pending") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      return !task.completed && due >= today;
    }
    if (filter === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      return !task.completed && due < today;
    }
    return true;
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vaccination: "Vacinação",

      reproduction: "Manejo Reprodutivo",
      maintenance: "Manutenção",
      feeding: "Alimentação",
      other: "Outros"
    };
    return labels[category] || category;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[priority] || colors.medium;
  };

  const isOverdue = (dueDate: string, completed: boolean) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return !completed && due < today;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Planejamento</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === "overdue" ? "default" : "outline"}
            onClick={() => setFilter("overdue")}
          >
            Atrasadas
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Concluídas
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Adicionar Nova Tarefa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vaccination">Vacinação</SelectItem>

                        <SelectItem value="reproduction">Manejo Reprodutivo</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="feeding">Alimentação</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Criar Tarefa</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Tarefas */}
        <div className="space-y-4">
          {filteredTasks?.map((task) => (
            <Card key={task.id} className={isOverdue(String(task.dueDate), task.completed || false) ? "border-red-500 border-2" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => toggleTask.mutate({ id: task.id })}
                      className="mt-1"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${task.completed ? "line-through text-gray-500" : ""}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {getCategoryLabel(task.category)}
                        </span>
                        <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(task.priority || 'medium')}`}>
                          {task.priority === "low" ? "Baixa" : task.priority === "medium" ? "Média" : "Alta"}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isOverdue(String(task.dueDate), task.completed || false) && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">Atrasada</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredTasks?.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma tarefa encontrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Alerts() {
  const { user } = useAuth();
  const farmId = user?.farmId || 0;
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "gmd" as "gmd" | "stock" | "expense" | "milk" | "custom",
    name: "",
    condition: "below" as "below" | "above" | "equal",
    threshold: "",
  });

  const { data: alerts, refetch } = trpc.alerts.list.useQuery({ farmId });
  const createMutation = trpc.alerts.create.useMutation();
  const toggleMutation = trpc.alerts.toggle.useMutation();
  const deleteMutation = trpc.alerts.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.threshold) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createMutation.mutateAsync({
        farmId,
        type: formData.type,
        name: formData.name,
        condition: formData.condition,
        threshold: parseFloat(formData.threshold),
      });

      toast.success("Alerta criado com sucesso!");
      setIsOpen(false);
      setFormData({
        type: "gmd",
        name: "",
        condition: "below",
        threshold: "",
      });
      refetch();
    } catch (error) {
      toast.error("Erro ao criar alerta");
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, isActive });
      toast.success(isActive ? "Alerta ativado" : "Alerta desativado");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar alerta");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este alerta?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Alerta excluído com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir alerta");
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      gmd: "GMD",
      stock: "Estoque",
      expense: "Despesas",
      milk: "Produção de Leite",
      custom: "Personalizado",
    };
    return labels[type] || type;
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      below: "Abaixo de",
      above: "Acima de",
      equal: "Igual a",
    };
    return labels[condition] || condition;
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Alertas Customizáveis</h1>
            <p className="text-muted-foreground mt-1">
              Configure alertas personalizados para monitorar métricas importantes
            </p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Alerta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Alerta</DialogTitle>
                <DialogDescription>
                  Configure um alerta para ser notificado quando uma condição for atingida
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Tipo de Alerta</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: typeof formData.type) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmd">GMD (Ganho Médio Diário)</SelectItem>
                      <SelectItem value="stock">Estoque</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                      <SelectItem value="milk">Produção de Leite</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Nome do Alerta</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: GMD abaixo do esperado"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condição</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value: typeof formData.condition) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below">Abaixo de</SelectItem>
                        <SelectItem value="above">Acima de</SelectItem>
                        <SelectItem value="equal">Igual a</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="threshold">Valor</Label>
                    <Input
                      id="threshold"
                      type="number"
                      step="0.01"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Alerta"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {alerts?.filter(a => a.isActive).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alertas Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">
                {alerts?.filter(a => !a.isActive).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Alertas */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas Configurados</CardTitle>
            <CardDescription>
              Gerencie seus alertas e receba notificações automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!alerts || alerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum alerta configurado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie seu primeiro alerta para começar a monitorar suas métricas
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Bell className={`w-5 h-5 ${alert.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <h3 className="font-medium">{alert.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(alert.type)} • {getConditionLabel(alert.condition)} {alert.threshold}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${alert.id}`} className="text-sm">
                          {alert.isActive ? "Ativo" : "Inativo"}
                        </Label>
                        <Switch
                          id={`toggle-${alert.id}`}
                          checked={alert.isActive}
                          onCheckedChange={(checked) => handleToggle(alert.id, checked)}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

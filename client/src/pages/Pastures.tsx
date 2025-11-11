import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { Calendar, Leaf, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Pastures() {
  const { user } = useAuth();
  const farmId = user?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    areaHectares: "",
    grassType: "",
    status: "active" as "active" | "resting" | "renovation",
    currentBatchId: "",
    rotationStartDate: "",
    restPeriodDays: "30",
  });

  const { data: pastures, refetch } = trpc.pastures.list.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: batches } = trpc.batches.list.useQuery(
    farmId ? { farmId } : skipToken
  );

  const createPasture = trpc.pastures.create.useMutation({
    onSuccess: () => {
      toast.success("Pastagem cadastrada com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setFormData({
        name: "",
        areaHectares: "",
        grassType: "",
        status: "active",
        currentBatchId: "",
        rotationStartDate: "",
        restPeriodDays: "30",
      });
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmId) {
      toast.error("Fazenda não identificada");
      return;
    }

    if (!formData.name || !formData.areaHectares) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createPasture.mutate({
      farmId,
      name: formData.name,
      areaHectares: parseInt(formData.areaHectares),
      grassType: formData.grassType || undefined,
      status: formData.status,
      currentBatchId: formData.currentBatchId ? parseInt(formData.currentBatchId) : undefined,
      rotationStartDate: formData.rotationStartDate || undefined,
      restPeriodDays: formData.restPeriodDays ? parseInt(formData.restPeriodDays) : undefined,
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      resting: "bg-yellow-100 text-yellow-700",
      renovation: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Ativa",
      resting: "Descanso",
      renovation: "Renovação",
    };
    return labels[status] || status;
  };

  const totalArea = pastures?.reduce((sum: number, p: any) => sum + (p.areaHectares || 0), 0) || 0;
  const activePastures = pastures?.filter((p: any) => p.status === "active").length || 0;
  const restingPastures = pastures?.filter((p: any) => p.status === "resting").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Leaf className="w-8 h-8 text-green-600" />
              Gestão de Pastagens
            </h1>
            <p className="text-gray-600 mt-1">
              Controle de rotação e manejo de pastagens
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Pastagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Pastagem</DialogTitle>
                <DialogDescription>
                  Adicione uma nova pastagem ao sistema de rotação
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Pastagem *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Pasto 1, Piquete A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="areaHectares">Área (hectares) *</Label>
                  <Input
                    id="areaHectares"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 5.5"
                    value={formData.areaHectares}
                    onChange={(e) => setFormData({ ...formData, areaHectares: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="grassType">Tipo de Capim</Label>
                  <Input
                    id="grassType"
                    placeholder="Ex: Brachiaria, Mombaça, Tanzânia"
                    value={formData.grassType}
                    onChange={(e) => setFormData({ ...formData, grassType: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    required
                  >
                    <option value="active">Ativa</option>
                    <option value="resting">Em Descanso</option>
                    <option value="renovation">Em Renovação</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="currentBatchId">Lote Atual</Label>
                  <select
                    id="currentBatchId"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.currentBatchId}
                    onChange={(e) => setFormData({ ...formData, currentBatchId: e.target.value })}
                  >
                    <option value="">Nenhum lote</option>
                    {batches?.map((batch: any) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="rotationStartDate">Data de Entrada</Label>
                  <Input
                    id="rotationStartDate"
                    type="date"
                    value={formData.rotationStartDate}
                    onChange={(e) => setFormData({ ...formData, rotationStartDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="restPeriodDays">Período de Descanso (dias)</Label>
                  <Input
                    id="restPeriodDays"
                    type="number"
                    placeholder="Ex: 30"
                    value={formData.restPeriodDays}
                    onChange={(e) => setFormData({ ...formData, restPeriodDays: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Cadastrar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Área Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalArea} ha</div>
              <p className="text-sm text-gray-600 mt-1">de pastagens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pastagens Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{activePastures}</div>
              <p className="text-sm text-gray-600 mt-1">em uso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Em Descanso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{restingPastures}</div>
              <p className="text-sm text-gray-600 mt-1">recuperando</p>
            </CardContent>
          </Card>
        </div>

        {/* Pastures Table */}
        <Card>
          <CardHeader>
            <CardTitle>Listagem de Pastagens</CardTitle>
            <CardDescription>Todas as pastagens cadastradas e seu status atual</CardDescription>
          </CardHeader>
          <CardContent>
            {!pastures || pastures.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Leaf className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma pastagem cadastrada.</p>
                <p className="text-sm mt-2">Clique em "Cadastrar Pastagem" para adicionar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Área (ha)</TableHead>
                    <TableHead>Tipo de Capim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lote Atual</TableHead>
                    <TableHead>Data de Entrada</TableHead>
                    <TableHead>Descanso (dias)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastures.map((pasture: any) => {
                    const batch = batches?.find((b: any) => b.id === pasture.currentBatchId);
                    
                    return (
                      <TableRow key={pasture.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{pasture.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            {pasture.areaHectares} ha
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700">
                            {pasture.grassType || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(pasture.status)}`}>
                            {getStatusLabel(pasture.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700">
                            {batch?.name || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {pasture.rotationStartDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(pasture.rotationStartDate).toLocaleDateString("pt-BR")}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700">
                            {pasture.restPeriodDays || 30} dias
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

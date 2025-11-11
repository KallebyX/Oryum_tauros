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
import { Calendar, Droplets, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MilkProduction() {
  const { user } = useAuth();
  const farmId = user?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    animalId: "",
    date: new Date().toISOString().split("T")[0],
    liters: "",
    lactationDay: "",
    notes: "",
  });

  const { data: animals } = trpc.batches.listAnimals.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: productions, refetch } = trpc.milk.list.useQuery(
    farmId ? { farmId } : skipToken
  );

  const createProduction = trpc.milk.create.useMutation({
    onSuccess: () => {
      toast.success("Produção registrada com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setFormData({
        animalId: "",
        date: new Date().toISOString().split("T")[0],
        liters: "",
        lactationDay: "",
        notes: "",
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

    if (!formData.animalId || !formData.liters) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createProduction.mutate({
      farmId,
      animalId: parseInt(formData.animalId),
      date: formData.date,
      liters: parseFloat(formData.liters),
      lactationDay: formData.lactationDay ? parseInt(formData.lactationDay) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const totalProduction = productions?.reduce((sum: number, p: any) => sum + (p.liters || 0), 0) || 0;
  const averageProduction = productions && productions.length > 0 
    ? (totalProduction / productions.length).toFixed(2) 
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Droplets className="w-8 h-8 text-green-600" />
              Produção de Leite
            </h1>
            <p className="text-gray-600 mt-1">
              Registre e acompanhe a produção diária de leite
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Produção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Produção de Leite</DialogTitle>
                <DialogDescription>
                  Adicione um novo registro de produção diária
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="animalId">Animal *</Label>
                  <select
                    id="animalId"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.animalId}
                    onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um animal</option>
                    {animals?.map((animal: any) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.tagId} - {animal.breed}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="liters">Litros Produzidos *</Label>
                  <Input
                    id="liters"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 25.5"
                    value={formData.liters}
                    onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lactationDay">Dia de Lactação</Label>
                  <Input
                    id="lactationDay"
                    type="number"
                    placeholder="Ex: 120"
                    value={formData.lactationDay}
                    onChange={(e) => setFormData({ ...formData, lactationDay: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <textarea
                    id="notes"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Observações adicionais..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                    Registrar
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
              <CardTitle className="text-sm font-medium text-gray-600">Produção Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalProduction.toFixed(1)} L</div>
              <p className="text-sm text-gray-600 mt-1">no período</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Média Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{averageProduction} L</div>
              <p className="text-sm text-gray-600 mt-1">por registro</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{productions?.length || 0}</div>
              <p className="text-sm text-gray-600 mt-1">no total</p>
            </CardContent>
          </Card>
        </div>

        {/* Productions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Produção</CardTitle>
            <CardDescription>Registros de produção de leite por animal e data</CardDescription>
          </CardHeader>
          <CardContent>
            {!productions || productions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Droplets className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro de produção encontrado.</p>
                <p className="text-sm mt-2">Clique em "Registrar Produção" para adicionar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead className="text-right">Litros</TableHead>
                    <TableHead className="text-right">Dia Lactação</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productions.map((production: any) => {
                    const animal = animals?.find((a: any) => a.id === production.animalId);
                    
                    return (
                      <TableRow key={production.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(production.date).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{animal?.tagId || "N/A"}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-green-600">
                              {production.liters} L
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {production.lactationDay ? (
                            <span className="text-gray-700">{production.lactationDay} dias</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {production.notes || "-"}
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

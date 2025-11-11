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
import { AlertCircle, Calendar, Plus, Shield, Syringe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Health() {
  const { user } = useAuth();
  const farmId = user?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    animalId: "",
    vaccineType: "",
    date: new Date().toISOString().split("T")[0],
    dosage: "",
    veterinarian: "",
    nextDueDate: "",
    notes: "",
  });

  const { data: animals } = trpc.batches.listAnimals.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: vaccinations, refetch } = trpc.health.listByFarm.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: upcoming } = trpc.health.upcoming.useQuery(
    farmId ? { farmId } : skipToken
  );

  const createVaccination = trpc.health.create.useMutation({
    onSuccess: () => {
      toast.success("Vacinação registrada com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setFormData({
        animalId: "",
        vaccineType: "",
        date: new Date().toISOString().split("T")[0],
        dosage: "",
        veterinarian: "",
        nextDueDate: "",
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

    if (!formData.animalId || !formData.vaccineType) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createVaccination.mutate({
      farmId,
      animalId: parseInt(formData.animalId),
      vaccineType: formData.vaccineType,
      date: formData.date,
      dosage: formData.dosage || undefined,
      veterinarian: formData.veterinarian || undefined,
      nextDueDate: formData.nextDueDate || undefined,
      notes: formData.notes || undefined,
    });
  };

  const totalVaccinations = vaccinations?.length || 0;
  const upcomingCount = upcoming?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-600" />
              Calendário Sanitário
            </h1>
            <p className="text-gray-600 mt-1">
              Controle de vacinas, vermífugos e tratamentos
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Vacinação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Vacinação</DialogTitle>
                <DialogDescription>
                  Adicione um novo registro de vacina ou tratamento
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
                  <Label htmlFor="vaccineType">Tipo de Vacina/Tratamento *</Label>
                  <Input
                    id="vaccineType"
                    placeholder="Ex: Aftosa, Brucelose, Vermífugo"
                    value={formData.vaccineType}
                    onChange={(e) => setFormData({ ...formData, vaccineType: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date">Data de Aplicação *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dosage">Dosagem</Label>
                  <Input
                    id="dosage"
                    placeholder="Ex: 5ml, 2 comprimidos"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="veterinarian">Veterinário</Label>
                  <Input
                    id="veterinarian"
                    placeholder="Nome do veterinário"
                    value={formData.veterinarian}
                    onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="nextDueDate">Próxima Dose</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
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
              <CardTitle className="text-sm font-medium text-gray-600">Vacinações Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalVaccinations}</div>
              <p className="text-sm text-gray-600 mt-1">registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Próximas Doses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{upcomingCount}</div>
              <p className="text-sm text-gray-600 mt-1">nos próximos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Animais Vacinados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {new Set(vaccinations?.map((v: any) => v.animalId)).size || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">únicos</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Vaccinations Alert */}
        {upcomingCount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" />
                Alertas de Vacinação
              </CardTitle>
              <CardDescription>Vacinas com próxima dose nos próximos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcoming?.map((vacc: any) => {
                  const animal = animals?.find((a: any) => a.id === vacc.animalId);
                  const daysUntil = Math.ceil(
                    (new Date(vacc.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div
                      key={vacc.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                    >
                      <div className="flex items-center gap-3">
                        <Syringe className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {animal?.tagId} - {vacc.vaccineType}
                          </p>
                          <p className="text-sm text-gray-600">
                            Próxima dose: {new Date(vacc.nextDueDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        daysUntil <= 7 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {daysUntil} dias
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vaccinations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vacinações</CardTitle>
            <CardDescription>Registros de vacinas e tratamentos por animal</CardDescription>
          </CardHeader>
          <CardContent>
            {!vaccinations || vaccinations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma vacinação registrada.</p>
                <p className="text-sm mt-2">Clique em "Registrar Vacinação" para adicionar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Vacina/Tratamento</TableHead>
                    <TableHead>Dosagem</TableHead>
                    <TableHead>Próxima Dose</TableHead>
                    <TableHead>Veterinário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaccinations.map((vaccination: any) => {
                    const animal = animals?.find((a: any) => a.id === vaccination.animalId);
                    
                    return (
                      <TableRow key={vaccination.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(vaccination.date).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{animal?.tagId || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Syringe className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-gray-900">
                              {vaccination.vaccineType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700">
                            {vaccination.dosage || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {vaccination.nextDueDate ? (
                            <span className="text-sm text-gray-700">
                              {new Date(vaccination.nextDueDate).toLocaleDateString("pt-BR")}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {vaccination.veterinarian || "-"}
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

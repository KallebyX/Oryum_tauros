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
import { Baby, Calendar, Heart, Plus, Syringe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Reproduction() {
  const { user } = useAuth();
  const farmId = user?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    animalId: "",
    eventType: "heat" as "heat" | "insemination" | "pregnancy_check" | "birth" | "abortion",
    date: new Date().toISOString().split("T")[0],
    bullId: "",
    semenCode: "",
    result: "",
    notes: "",
  });

  const { data: animals } = trpc.batches.listAnimals.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: events, refetch } = trpc.reproduction.listByFarm.useQuery(
    farmId ? { farmId } : skipToken
  );

  const createEvent = trpc.reproduction.create.useMutation({
    onSuccess: () => {
      toast.success("Evento registrado com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setFormData({
        animalId: "",
        eventType: "heat",
        date: new Date().toISOString().split("T")[0],
        bullId: "",
        semenCode: "",
        result: "",
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

    if (!formData.animalId) {
      toast.error("Selecione um animal");
      return;
    }

    createEvent.mutate({
      farmId,
      animalId: parseInt(formData.animalId),
      eventType: formData.eventType,
      date: formData.date,
      bullId: formData.bullId ? parseInt(formData.bullId) : undefined,
      semenCode: formData.semenCode || undefined,
      result: formData.result || undefined,
      notes: formData.notes || undefined,
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "heat":
        return <Heart className="w-5 h-5 text-pink-500" />;
      case "insemination":
        return <Syringe className="w-5 h-5 text-blue-500" />;
      case "pregnancy_check":
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case "birth":
        return <Baby className="w-5 h-5 text-green-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      heat: "Cio",
      insemination: "Inseminação",
      pregnancy_check: "Diagnóstico Gestação",
      birth: "Parto",
      abortion: "Aborto",
    };
    return labels[type] || type;
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      heat: "bg-pink-100 text-pink-700",
      insemination: "bg-blue-100 text-blue-700",
      pregnancy_check: "bg-purple-100 text-purple-700",
      birth: "bg-green-100 text-green-700",
      abortion: "bg-red-100 text-red-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const heatEvents = events?.filter((e: any) => e.eventType === "heat").length || 0;
  const inseminationEvents = events?.filter((e: any) => e.eventType === "insemination").length || 0;
  const birthEvents = events?.filter((e: any) => e.eventType === "birth").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-green-600" />
              Manejo Reprodutivo
            </h1>
            <p className="text-gray-600 mt-1">
              Controle de cio, inseminação, gestação e partos
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Evento Reprodutivo</DialogTitle>
                <DialogDescription>
                  Adicione um novo evento ao histórico reprodutivo
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
                    {animals?.filter((a: any) => a.sex === "female").map((animal: any) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.tagId} - {animal.breed}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="eventType">Tipo de Evento *</Label>
                  <select
                    id="eventType"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                    required
                  >
                    <option value="heat">Cio</option>
                    <option value="insemination">Inseminação</option>
                    <option value="pregnancy_check">Diagnóstico de Gestação</option>
                    <option value="birth">Parto</option>
                    <option value="abortion">Aborto</option>
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

                {(formData.eventType === "insemination" || formData.eventType === "birth") && (
                  <div>
                    <Label htmlFor="bullId">ID do Touro</Label>
                    <Input
                      id="bullId"
                      type="number"
                      placeholder="ID do touro"
                      value={formData.bullId}
                      onChange={(e) => setFormData({ ...formData, bullId: e.target.value })}
                    />
                  </div>
                )}

                {formData.eventType === "insemination" && (
                  <div>
                    <Label htmlFor="semenCode">Código do Sêmen</Label>
                    <Input
                      id="semenCode"
                      placeholder="Ex: BR123456"
                      value={formData.semenCode}
                      onChange={(e) => setFormData({ ...formData, semenCode: e.target.value })}
                    />
                  </div>
                )}

                {formData.eventType === "pregnancy_check" && (
                  <div>
                    <Label htmlFor="result">Resultado</Label>
                    <select
                      id="result"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.result}
                      onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    >
                      <option value="">Selecione</option>
                      <option value="pregnant">Prenha</option>
                      <option value="not_pregnant">Vazia</option>
                      <option value="unknown">Inconclusivo</option>
                    </select>
                  </div>
                )}

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
              <CardTitle className="text-sm font-medium text-gray-600">Cios Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">{heatEvents}</div>
              <p className="text-sm text-gray-600 mt-1">no período</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Inseminações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{inseminationEvents}</div>
              <p className="text-sm text-gray-600 mt-1">realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Partos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{birthEvents}</div>
              <p className="text-sm text-gray-600 mt-1">registrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Reprodutivo</CardTitle>
            <CardDescription>Eventos reprodutivos registrados por animal</CardDescription>
          </CardHeader>
          <CardContent>
            {!events || events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento reprodutivo registrado.</p>
                <p className="text-sm mt-2">Clique em "Registrar Evento" para adicionar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Tipo de Evento</TableHead>
                    <TableHead>Resultado/Detalhes</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event: any) => {
                    const animal = animals?.find((a: any) => a.id === event.animalId);
                    
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(event.date).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{animal?.tagId || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.eventType)}
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventColor(event.eventType)}`}>
                              {getEventLabel(event.eventType)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.result && (
                            <span className="text-sm text-gray-700">{event.result}</span>
                          )}
                          {event.semenCode && (
                            <span className="text-sm text-gray-700">Sêmen: {event.semenCode}</span>
                          )}
                          {!event.result && !event.semenCode && "-"}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {event.notes || "-"}
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

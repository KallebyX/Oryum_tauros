import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { Activity, Plus, Scale, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Animals() {
  const { user } = useAuth();
  const farmId = user?.id;

  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showWeighingForm, setShowWeighingForm] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);

  const [animalFormData, setAnimalFormData] = useState({
    tagId: "",
    species: "cattle" as "cattle" | "sheep" | "goat" | "buffalo",
    breed: "",
    birthDate: "",
    sex: "female" as "male" | "female",
    batchId: null as number | null,
  });

  const [weighingFormData, setWeighingFormData] = useState({
    weight: "",
    date: new Date().toISOString().split('T')[0],
  });

  const { data: animals, refetch: refetchAnimals } = trpc.batches.listAnimals.useQuery(
    farmId ? { farmId } : skipToken
  );

  const { data: batches } = trpc.batches.list.useQuery(
    farmId ? { farmId } : skipToken
  );

  const createAnimal = trpc.batches.createAnimal.useMutation({
    onSuccess: () => {
      toast.success("Animal cadastrado com sucesso!");
      setShowAnimalForm(false);
      setAnimalFormData({
        tagId: "",
        species: "cattle",
        breed: "",
        birthDate: "",
        sex: "female",
        batchId: null,
      });
      refetchAnimals();
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar animal: ${error.message}`);
    },
  });

  const createWeighing = trpc.batches.createWeighing.useMutation({
    onSuccess: () => {
      toast.success("Pesagem registrada com sucesso!");
      setShowWeighingForm(false);
      setWeighingFormData({
        weight: "",
        date: new Date().toISOString().split('T')[0],
      });
      refetchAnimals();
    },
    onError: (error) => {
      toast.error(`Erro ao registrar pesagem: ${error.message}`);
    },
  });

  const handleCreateAnimal = () => {
    if (!farmId) {
      toast.error("Fazenda não identificada");
      return;
    }

    if (!animalFormData.tagId || !animalFormData.breed || !animalFormData.birthDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createAnimal.mutate({
      farmId,
      tagId: animalFormData.tagId,
      species: animalFormData.species,
      breed: animalFormData.breed || undefined,
      birthDate: new Date(animalFormData.birthDate),
      sex: animalFormData.sex,
      batchId: animalFormData.batchId,
    });
  };

  const handleCreateWeighing = () => {
    if (!selectedAnimalId) {
      toast.error("Nenhum animal selecionado");
      return;
    }

    if (!weighingFormData.weight) {
      toast.error("Informe o peso do animal");
      return;
    }

    createWeighing.mutate({
      animalId: selectedAnimalId,
      weight: parseFloat(weighingFormData.weight),
      date: new Date(weighingFormData.date),
    });
  };

  const openWeighingModal = (animalId: number) => {
    setSelectedAnimalId(animalId);
    setShowWeighingForm(true);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    return months > 0 ? `${months} meses` : `${diffDays} dias`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-600" />
              Gestão de Animais
            </h1>
            <p className="text-gray-600 mt-1">Rastreamento individual e controle de desempenho</p>
          </div>

          <Dialog open={showAnimalForm} onOpenChange={setShowAnimalForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Animal</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Brinco / Tag ID *</Label>
                  <Input
                    value={animalFormData.tagId}
                    onChange={(e) => setAnimalFormData({ ...animalFormData, tagId: e.target.value })}
                    placeholder="Ex: 001234"
                  />
                </div>
                <div>
                  <Label>Espécie *</Label>
                  <Select
                    value={animalFormData.species}
                    onValueChange={(value: "cattle" | "sheep" | "goat" | "buffalo") =>
                      setAnimalFormData({ ...animalFormData, species: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cattle">Bovino</SelectItem>
                      <SelectItem value="sheep">Ovino</SelectItem>
                      <SelectItem value="goat">Caprino</SelectItem>
                      <SelectItem value="buffalo">Bubalino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Raça *</Label>
                  <Input
                    value={animalFormData.breed}
                    onChange={(e) => setAnimalFormData({ ...animalFormData, breed: e.target.value })}
                    placeholder="Ex: Nelore, Angus, Holandês"
                  />
                </div>
                <div>
                  <Label>Data de Nascimento *</Label>
                  <Input
                    type="date"
                    value={animalFormData.birthDate}
                    onChange={(e) => setAnimalFormData({ ...animalFormData, birthDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Sexo</Label>
                  <Select
                    value={animalFormData.sex}
                    onValueChange={(value: "male" | "female") =>
                      setAnimalFormData({ ...animalFormData, sex: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Fêmea</SelectItem>
                      <SelectItem value="male">Macho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Lote (opcional)</Label>
                  <Select
                    value={animalFormData.batchId?.toString() || ""}
                    onValueChange={(value) =>
                      setAnimalFormData({ ...animalFormData, batchId: value ? parseInt(value) : null })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          {batch.name} - {batch.animalType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAnimalForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAnimal} className="bg-green-600 hover:bg-green-700">
                  Cadastrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Animais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{animals?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Fêmeas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                {animals?.filter((a: any) => a.sex === "female").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Machos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {animals?.filter((a: any) => a.sex === "male").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Média de Peso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {animals && animals.length > 0
                  ? Math.round(
                      animals.reduce((sum: number, a: any) => sum + (a.currentWeight || 0), 0) / animals.length
                    )
                  : 0}
                <span className="text-sm ml-1">kg</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Animals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Animais Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {!animals || animals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum animal cadastrado ainda.</p>
                <p className="text-sm mt-2">Clique em "Cadastrar Animal" para começar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brinco</TableHead>
                    <TableHead>RFID</TableHead>
                    <TableHead>Raça</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Peso Atual</TableHead>
                    <TableHead>GMD</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animals.map((animal: any) => (
                    <TableRow key={animal.id}>
                      <TableCell className="font-medium">{animal.tagId}</TableCell>
                      <TableCell className="text-gray-600">{animal.rfid || "-"}</TableCell>
                      <TableCell>{animal.breed}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            animal.sex === "female"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {animal.sex === "female" ? "Fêmea" : "Macho"}
                        </span>
                      </TableCell>
                      <TableCell>{calculateAge(animal.birthDate)}</TableCell>
                      <TableCell>{animal.status || "Ativo"}</TableCell>
                      <TableCell className="font-semibold">
                        {animal.currentWeight ? `${animal.currentWeight} kg` : "-"}
                      </TableCell>
                      <TableCell>
                        {animal.gmd ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-semibold">{animal.gmd.toFixed(3)} kg/dia</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWeighingModal(animal.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Scale className="w-4 h-4 mr-1" />
                          Pesar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Weighing Modal */}
        <Dialog open={showWeighingForm} onOpenChange={setShowWeighingForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pesagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Peso (kg) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weighingFormData.weight}
                  onChange={(e) => setWeighingFormData({ ...weighingFormData, weight: e.target.value })}
                  placeholder="Ex: 350.5"
                />
              </div>
              <div>
                <Label>Data da Pesagem *</Label>
                <Input
                  type="date"
                  value={weighingFormData.date}
                  onChange={(e) => setWeighingFormData({ ...weighingFormData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowWeighingForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateWeighing} className="bg-green-600 hover:bg-green-700">
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sprout } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    state: "",
    sizeHectares: "",
    animalCount: "",
    farmType: "cattle",
  });

  const createFarm = trpc.farms.create.useMutation({
    onSuccess: () => {
      toast.success("Fazenda criada com sucesso!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Erro ao criar fazenda: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.region) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    createFarm.mutate({
      name: formData.name,
      region: formData.region,
      state: formData.state,
      sizeHectares: formData.sizeHectares ? parseInt(formData.sizeHectares) : undefined,
      animalCount: formData.animalCount ? parseInt(formData.animalCount) : undefined,
      farmType: formData.farmType,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sprout className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Bem-vindo ao {APP_TITLE}!</CardTitle>
          <CardDescription className="text-base">
            Vamos configurar sua fazenda para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Fazenda *</Label>
              <Input
                id="name"
                placeholder="Ex: Fazenda São João"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Região *</Label>
                <Input
                  id="region"
                  placeholder="Ex: Sul"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="Ex: RS"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sizeHectares">Tamanho (hectares)</Label>
                <Input
                  id="sizeHectares"
                  type="number"
                  placeholder="Ex: 500"
                  value={formData.sizeHectares}
                  onChange={(e) => setFormData({ ...formData, sizeHectares: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="animalCount">Número de Animais</Label>
                <Input
                  id="animalCount"
                  type="number"
                  placeholder="Ex: 200"
                  value={formData.animalCount}
                  onChange={(e) => setFormData({ ...formData, animalCount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmType">Tipo de Produção</Label>
              <select
                id="farmType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.farmType}
                onChange={(e) => setFormData({ ...formData, farmType: e.target.value })}
              >
                <option value="cattle">Gado</option>
                <option value="sheep">Ovinos</option>
                <option value="mixed">Misto</option>
              </select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={createFarm.isPending}
            >
              {createFarm.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Fazenda"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
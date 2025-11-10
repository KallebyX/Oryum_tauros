import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, MapPin, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { APP_TITLE } from "@/const";

export default function Onboarding() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    state: "",
    sizeHectares: "",
    farmType: "",
  });

  const createFarm = trpc.farms.create.useMutation({
    onSuccess: () => {
      setLocation("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    createFarm.mutate({
      name: formData.name,
      region: formData.region,
      state: formData.state,
      sizeHectares: parseInt(formData.sizeHectares),
      farmType: formData.farmType as "cattle" | "dairy" | "mixed",
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Bem-vindo ao {APP_TITLE}!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Vamos configurar sua fazenda para começar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Fazenda *</Label>
              <Input
                id="name"
                placeholder="Ex: Fazenda Santa Maria"
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
                  placeholder="Ex: Centro-Oeste"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GO">Goiás</SelectItem>
                    <SelectItem value="MT">Mato Grosso</SelectItem>
                    <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Tamanho (hectares) *</Label>
                <Input
                  id="size"
                  type="number"
                  placeholder="Ex: 500"
                  value={formData.sizeHectares}
                  onChange={(e) => setFormData({ ...formData, sizeHectares: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Produção *</Label>
                <Select
                  value={formData.farmType}
                  onValueChange={(value) => setFormData({ ...formData, farmType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">Gado de Corte</SelectItem>
                    <SelectItem value="dairy">Gado de Leite</SelectItem>
                    <SelectItem value="mixed">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Dica:</p>
                  <p>
                    Após configurar, você poderá adicionar lotes, animais e controlar finanças!
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createFarm.isPending}
            >
              {createFarm.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Começar a Usar"
              )}
            </Button>

            {createFarm.isError && (
              <p className="text-sm text-red-600 text-center">
                Erro ao criar fazenda. Tente novamente.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

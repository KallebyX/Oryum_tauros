import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { AlertTriangle, Package, Plus } from "lucide-react";

export default function Inventory() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    minStock: "",
  });

  const { data: items, refetch } = trpc.inventory.list.useQuery(user?.farmId ? { farmId: user.farmId } : skipToken);
  const createItem = trpc.inventory.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({ name: "", category: "", quantity: "", unit: "", minStock: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.farmId) return;
    createItem.mutate({
      farmId: user.farmId,
      name: formData.name,
      type: "other" as const,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      minStock: parseInt(formData.minStock),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Novo Item de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Item *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade *</Label>
                    <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade *</Label>
                    <Input placeholder="kg, L, saco" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque Mínimo *</Label>
                    <Input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} required />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createItem.isPending}>Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {items?.map((item) => {
            const isLowStock = item.minStock ? item.quantity <= item.minStock : false;
            const stockPercentage = item.minStock ? (item.quantity / (item.minStock * 2)) * 100 : 100;
            
            return (
              <Card key={item.id} className={isLowStock ? 'border-red-300 bg-red-50' : ''}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                  {isLowStock ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Package className="h-5 w-5 text-green-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold">{item.quantity}</span>
                      <span className="text-sm text-gray-600">{item.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isLowStock ? 'bg-red-600' : stockPercentage < 50 ? 'bg-yellow-500' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Mín: {item.minStock || 0}</span>
                      <span className="font-medium">{item.type}</span>
                    </div>
                    {isLowStock && (
                      <div className="text-xs text-red-600 font-medium mt-2">
                        ⚠️ Estoque baixo! Reabastecer
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!items || items.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum item no estoque</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

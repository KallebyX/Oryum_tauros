import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Package, AlertTriangle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Inventory() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: farms } = trpc.farms.list.useQuery(undefined, { enabled: isAuthenticated });
  const farm = farms?.[0];
  
  const { data: items, isLoading, refetch } = trpc.inventory.list.useQuery(
    { farmId: farm?.id || 0 },
    { enabled: !!farm }
  );

  const createItem = trpc.inventory.create.useMutation({
    onSuccess: () => {
      toast.success("Item adicionado ao estoque!");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar item: " + error.message);
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    quantity: "",
    unit: "kg",
    unitCost: "",
    minStock: "",
    expiryDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;

    createItem.mutate({
      farmId: farm.id,
      name: formData.name,
      type: formData.type,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      unitCost: formData.unitCost ? Math.round(parseFloat(formData.unitCost) * 100) : undefined,
      minStock: formData.minStock ? parseInt(formData.minStock) : 0,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
    });
  };

  if (!isAuthenticated || !farm) {
    setLocation("/");
    return null;
  }

  const lowStockItems = items?.filter(item => item.quantity !== null && item.quantity <= (item.minStock || 0)) || [];
  const expiringItems = items?.filter(item => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Gestão de Estoque</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Item de Estoque</DialogTitle>
                  <DialogDescription>Adicione um novo insumo ao estoque</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Input
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        placeholder="Ex: Ração, Medicamento, Fertilizante"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unidade</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          placeholder="kg, L, un"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="unitCost">Custo Unitário (R$)</Label>
                        <Input
                          id="unitCost"
                          type="number"
                          step="0.01"
                          value={formData.unitCost}
                          onChange={(e) => setFormData({...formData, unitCost: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="minStock">Estoque Mínimo</Label>
                        <Input
                          id="minStock"
                          type="number"
                          value={formData.minStock}
                          onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Data de Validade</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createItem.isPending}>
                      {createItem.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Adicionar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {(lowStockItems.length > 0 || expiringItems.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {lowStockItems.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="w-5 h-5" />
                    Estoque Baixo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="text-sm">
                        <span className="font-medium">{item.name}</span>: {item.quantity} {item.unit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {expiringItems.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    Vencendo em 30 Dias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expiringItems.map(item => (
                      <div key={item.id} className="text-sm">
                        <span className="font-medium">{item.name}</span>: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : ''}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Itens em Estoque</CardTitle>
            <CardDescription>Controle de insumos e materiais</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : items && items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isLowStock = item.quantity !== null && item.quantity <= (item.minStock || 0);
                    const daysUntilExpiry = item.expiryDate ? Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          {isLowStock && <Badge variant="destructive">Baixo</Badge>}
                          {isExpiringSoon && <Badge variant="outline" className="ml-2">Vencendo</Badge>}
                          {!isLowStock && !isExpiringSoon && <Badge variant="secondary">OK</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item no estoque ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

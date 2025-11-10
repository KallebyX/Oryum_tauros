import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Calendar, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Planning() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: farms } = trpc.farms.list.useQuery(undefined, { enabled: isAuthenticated });
  const farm = farms?.[0];
  
  const { data: events, isLoading, refetch } = trpc.planning.list.useQuery(
    { farmId: farm?.id || 0 },
    { enabled: !!farm }
  );

  const createEvent = trpc.planning.create.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar evento: " + error.message);
    },
  });

  const toggleComplete = trpc.planning.toggleComplete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "task",
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;

    createEvent.mutate({
      farmId: farm.id,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      date: new Date(formData.date),
    });
  };

  if (!isAuthenticated || !farm) {
    setLocation("/");
    return null;
  }

  const upcomingEvents = events?.filter(e => new Date(e.date) >= new Date() && !e.completed) || [];
  const pastEvents = events?.filter(e => new Date(e.date) < new Date() || e.completed) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Planejamento</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Evento</DialogTitle>
                  <DialogDescription>Agende uma tarefa ou lembrete</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Input
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        placeholder="Ex: vacinação, reprodução, tarefa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createEvent.isPending}>
                      {createEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Criar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>{upcomingEvents.length} eventos agendados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => toggleComplete.mutate({ id: event.id })}
                      >
                        <Circle className="w-5 h-5" />
                      </Button>
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{event.type}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento agendado
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eventos Concluídos</CardTitle>
              <CardDescription>{pastEvents.length} eventos finalizados</CardDescription>
            </CardHeader>
            <CardContent>
              {pastEvents.length > 0 ? (
                <div className="space-y-4">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-4 border rounded-lg opacity-60">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium line-through">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{event.type}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento concluído
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

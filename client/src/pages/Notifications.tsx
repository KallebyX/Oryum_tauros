import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type NotificationType = "all" | "vaccination" | "task" | "challenge" | "stock" | "other";

export default function Notifications() {
  const [filter, setFilter] = useState<NotificationType>("all");
  const utils = trpc.useUtils();

  const { data: notifications = [] } = trpc.notifications.list.useQuery();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n: any) => n.type === filter);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return "💉";
      case "task":
        return "📋";
      case "challenge":
        return "🏆";
      case "stock":
        return "📦";
      default:
        return "🔔";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vaccination: "Vacinação",
      task: "Tarefa",
      challenge: "Desafio",
      stock: "Estoque",
      other: "Outros",
    };
    return labels[type] || "Outros";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Notificações</h1>
              <p className="text-gray-600">
                {unreadCount > 0
                  ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}`
                  : "Todas as notificações foram lidas"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                variant="outline"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtrar por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as NotificationType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="vaccination">Vacinação</SelectItem>
                <SelectItem value="task">Tarefas</SelectItem>
                <SelectItem value="challenge">Desafios</SelectItem>
                <SelectItem value="stock">Estoque</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Lista de Notificações */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-gray-500">
                {filter === "all"
                  ? "Nenhuma notificação encontrada"
                  : `Nenhuma notificação de ${getTypeLabel(filter).toLowerCase()}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-blue-600 bg-blue-50" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{notification.title}</h3>
                          <Badge variant="outline" className="mt-1">
                            {getTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              markAsReadMutation.mutate({ id: notification.id })
                            }
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

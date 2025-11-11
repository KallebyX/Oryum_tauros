import { ENV } from "./env";
import * as db from "../db";

interface NotificationPayload {
  userId: number;
  title: string;
  content: string;
  type?: "info" | "warning" | "success" | "error";
  link?: string;
}

/**
 * Enviar notificação para um usuário usando o sistema built-in do Manus
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    // Salvar notificação no banco de dados
    await db.createNotification({
      userId: payload.userId,
      type: "other",
      title: payload.title,
      message: payload.content,
    });
    
    const response = await fetch(`${ENV.forgeApiUrl}/notifications/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        user_id: payload.userId,
        title: payload.title,
        content: payload.content,
        type: payload.type || "info",
        link: payload.link,
      }),
    });

    if (!response.ok) {
      console.error(`[Notifications] Failed to send notification: ${response.statusText}`);
      return false;
    }

    console.log(`[Notifications] Notification sent to user ${payload.userId}: ${payload.title}`);
    return true;
  } catch (error: any) {
    console.error(`[Notifications] Error sending notification: ${error.message}`);
    return false;
  }
}

/**
 * Enviar notificação de alerta de vacinação
 */
export async function notifyVaccinationAlert(
  userId: number,
  animalTag: string,
  vaccineType: string,
  dueDate: Date
): Promise<boolean> {
  const daysUntil = Math.ceil(
    (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return sendNotification({
    userId,
    title: "Alerta de Vacinação",
    content: `O animal ${animalTag} precisa receber ${vaccineType} em ${daysUntil} dias (${dueDate.toLocaleDateString("pt-BR")})`,
    type: daysUntil <= 3 ? "warning" : "info",
    link: "/health",
  });
}

/**
 * Enviar notificação de tarefa pendente
 */
export async function notifyPendingTask(
  userId: number,
  taskTitle: string,
  dueDate: Date
): Promise<boolean> {
  const isOverdue = dueDate < new Date();

  return sendNotification({
    userId,
    title: isOverdue ? "Tarefa Atrasada" : "Tarefa Pendente",
    content: `${taskTitle} - Vencimento: ${dueDate.toLocaleDateString("pt-BR")}`,
    type: isOverdue ? "error" : "warning",
    link: "/planning",
  });
}

/**
 * Enviar notificação de conquista de desafio
 */
export async function notifyChallengeCompleted(
  userId: number,
  challengeTitle: string,
  pointsEarned: number
): Promise<boolean> {
  return sendNotification({
    userId,
    title: "Desafio Concluído! 🎉",
    content: `Parabéns! Você completou o desafio "${challengeTitle}" e ganhou ${pointsEarned} pontos!`,
    type: "success",
    link: "/challenges",
  });
}

/**
 * Enviar notificação de novo badge ESG
 */
export async function notifyNewESGBadge(
  userId: number,
  badgeLevel: "bronze" | "silver" | "gold",
  score: number
): Promise<boolean> {
  const badges: Record<string, string> = {
    bronze: "Bronze 🥉",
    silver: "Prata 🥈",
    gold: "Ouro 🥇",
  };

  return sendNotification({
    userId,
    title: `Novo Selo ESG: ${badges[badgeLevel]}`,
    content: `Parabéns! Você alcançou o selo ${badges[badgeLevel]} com ${score} pontos ESG!`,
    type: "success",
    link: "/esg",
  });
}

/**
 * Enviar notificação de estoque baixo
 */
export async function notifyLowStock(
  userId: number,
  itemName: string,
  currentQuantity: number,
  minQuantity: number
): Promise<boolean> {
  return sendNotification({
    userId,
    title: "Alerta de Estoque Baixo",
    content: `${itemName} está com estoque baixo: ${currentQuantity} (mínimo: ${minQuantity})`,
    type: "warning",
    link: "/inventory",
  });
}

/**
 * Notificar quando uma meta for concluída
 */
export async function notifyGoalCompleted(
  userId: number,
  goalTitle: string,
  targetValue: string,
  unit: string
): Promise<boolean> {
  return sendNotification({
    userId,
    title: "🎯 Meta Concluída!",
    content: `Parabéns! Você atingiu a meta "${goalTitle}" de ${targetValue} ${unit}.`,
    type: "success",
    link: "/goals",
  });
}

/**
 * Notificar quando faltar 7 dias para o prazo de uma meta
 */
export async function notifyGoalDeadlineApproaching(
  userId: number,
  goalTitle: string,
  daysLeft: number
): Promise<boolean> {
  return sendNotification({
    userId,
    title: "⏰ Meta Próxima do Prazo",
    content: `A meta "${goalTitle}" vence em ${daysLeft} dias. Continue trabalhando para atingi-la!`,
    type: "warning",
    link: "/goals",
  });
}

/**
 * Helper para enviar notificação diretamente (usado internamente)
 */
async function notifyUser(userId: number, data: { title: string; content: string }) {
  return sendNotification({
    userId,
    title: data.title,
    content: data.content,
    type: "info",
  });
}

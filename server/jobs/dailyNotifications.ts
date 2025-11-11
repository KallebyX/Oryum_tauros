import * as db from "../db";
import { users } from "../../drizzle/schema";
import {
  notifyVaccinationAlert,
  notifyPendingTask,
  notifyLowStock,
  notifyGoalCompleted,
  notifyGoalDeadlineApproaching,
} from "../_core/notifications";

/**
 * Job diário que verifica e envia notificações proativas
 * Deve ser executado uma vez por dia (ex: 8h da manhã)
 */
export async function runDailyNotifications() {
  console.log(`[Daily Job] Starting daily notifications job at ${new Date().toISOString()}`);

  try {
    // 1. Verificar vacinações próximas (próximos 7 dias)
    await checkUpcomingVaccinations();

    // 2. Verificar tarefas pendentes e atrasadas
    await checkPendingTasks();

    // 3. Verificar estoque baixo
    await checkLowStock();

    // 4. Verificar metas (concluídas e próximas do prazo)
    await checkGoals();
    
    // 5. Verificar alertas customizáveis
    await checkCustomAlerts();

    console.log("[Daily Job] Daily notifications job completed successfully");
  } catch (error: any) {
    console.error(`[Daily Job] Error running daily notifications: ${error.message}`);
  }
}

/**
 * Verificar vacinações que vencem nos próximos 7 dias
 */
async function checkUpcomingVaccinations() {
  console.log("[Daily Job] Checking upcoming vaccinations...");

  try {
    // Buscar todas as fazendas ativas
    // Buscar todos os usuários (cada usuário representa uma fazenda)
    const dbInstance = await db.getDb();
    if (!dbInstance) return;
    
    const usersData = await dbInstance.select().from(users);
    const farms = usersData.map((u: any) => ({ id: u.id }));

    for (const farm of farms) {
      // Buscar vacinações próximas desta fazenda
      const upcomingVaccinations = await db.getUpcomingVaccinations(farm.id);

      for (const vaccination of upcomingVaccinations) {
        if (!vaccination.nextDueDate) continue;

        const daysUntil = Math.ceil(
          (new Date(vaccination.nextDueDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Notificar se faltar 7 dias ou menos
        if (daysUntil <= 7 && daysUntil >= 0) {
          if (!vaccination.animalId) continue;
          const animal = await db.getAnimalById(vaccination.animalId);
          if (animal) {
            // Buscar usuário da fazenda (owner)
            const user = usersData.find((u: any) => u.id === farm.id);
            if (user) {
              await notifyVaccinationAlert(
                user.id,
                animal.tagId,
                vaccination.vaccineType,
                new Date(vaccination.nextDueDate)
              );
              console.log(
                `[Daily Job] Sent vaccination alert for animal ${animal.tagId} to user ${user.id}`
              );
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error(`[Daily Job] Error checking vaccinations: ${error.message}`);
  }
}

/**
 * Verificar tarefas pendentes e atrasadas
 */
async function checkPendingTasks() {
  console.log("[Daily Job] Checking pending tasks...");

  try {
    // Buscar todos os usuários (cada usuário representa uma fazenda)
    const dbInstance = await db.getDb();
    if (!dbInstance) return;
    
    const usersData = await dbInstance.select().from(users);
    const farms = usersData.map((u: any) => ({ id: u.id }));

    for (const farm of farms) {
      const tasks = await db.getPlanningTasksByFarmId(farm.id);

      for (const task of tasks) {
        // Ignorar tarefas já concluídas
        if (task.completed) continue;

        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Notificar se tarefa vence hoje, amanhã ou está atrasada
        if (daysUntil <= 1) {
          const user = usersData.find((u: any) => u.id === farm.id);
          if (user) {
            await notifyPendingTask(user.id, task.title, dueDate);
            console.log(`[Daily Job] Sent task alert for "${task.title}" to user ${user.id}`);
          }
        }
      }
    }
  } catch (error: any) {
    console.error(`[Daily Job] Error checking tasks: ${error.message}`);
  }
}

/**
 * Verificar itens de estoque baixo
 */
async function checkLowStock() {
  console.log("[Daily Job] Checking low stock items...");

  try {
    // Buscar todos os usuários (cada usuário representa uma fazenda)
    const dbInstance = await db.getDb();
    if (!dbInstance) return;
    
    const usersData = await dbInstance.select().from(users);
    const farms = usersData.map((u: any) => ({ id: u.id }));

    for (const farm of farms) {
      const inventoryItems = await db.getInventoryByFarmId(farm.id);

      for (const item of inventoryItems) {
        // Verificar se quantidade está abaixo do mínimo
        const minStock = item.minStock || 0;
        if (item.quantity <= minStock) {
          const user = usersData.find((u: any) => u.id === farm.id);
          if (user) {
            await notifyLowStock(user.id, item.name, item.quantity, minStock);
            console.log(
              `[Daily Job] Sent low stock alert for "${item.name}" to user ${user.id}`
            );
          }
        }
      }
    }
  } catch (error: any) {
    console.error(`[Daily Job] Error checking stock: ${error.message}`);
  }
}

/**
 * Agendar job para rodar diariamente às 8h
 */
export function scheduleDailyNotifications() {
  // Calcular próxima execução às 8h
  const now = new Date();
  const next8AM = new Date(now);
  next8AM.setHours(8, 0, 0, 0);

  // Se já passou das 8h hoje, agendar para amanhã
  if (now.getHours() >= 8) {
    next8AM.setDate(next8AM.getDate() + 1);
  }

  const msUntilNext = next8AM.getTime() - now.getTime();

  console.log(
    `[Daily Job] Scheduling next run at ${next8AM.toLocaleString("pt-BR")} (in ${Math.round(msUntilNext / 1000 / 60)} minutes)`
  );

  // Agendar primeira execução
  setTimeout(() => {
    runDailyNotifications();

    // Agendar execuções subsequentes a cada 24 horas
    setInterval(runDailyNotifications, 24 * 60 * 60 * 1000);
  }, msUntilNext);
}


/**
 * Verificar metas concluídas e próximas do prazo
 */
async function checkGoals() {
  console.log("[Daily Job] Checking goals...");

  try {
    const dbInstance = await db.getDb();
    if (!dbInstance) return;
    
    const usersData = await dbInstance.select().from(users);
    const farms = usersData.map((u: any) => ({ id: u.id, userId: u.id }));

    for (const farm of farms) {
      // Buscar metas ativas desta fazenda
      const goals = await db.getGoalsByFarmId(farm.id);
      const activeGoals = goals.filter((g: any) => g.status === "active");

      for (const goal of activeGoals) {
        const currentValue = parseFloat(goal.currentValue || "0");
        const targetValue = parseFloat(goal.targetValue || "0");
        const progress = (currentValue / targetValue) * 100;

        // Verificar se meta foi concluída (100% de progresso)
        if (progress >= 100) {
          await notifyGoalCompleted(
            farm.userId,
            goal.title,
            goal.targetValue || "0",
            goal.unit || ""
          );
          console.log(`[Daily Job] Goal completed notification sent for goal ${goal.id}`);
        }

        // Verificar se faltam 7 dias ou menos para o prazo
        const deadline = new Date(goal.deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 7 && daysLeft > 0 && progress < 100) {
          await notifyGoalDeadlineApproaching(
            farm.userId,
            goal.title,
            daysLeft
          );
          console.log(`[Daily Job] Goal deadline notification sent for goal ${goal.id} (${daysLeft} days left)`);
        }
      }
    }

    console.log("[Daily Job] Goals check completed");
  } catch (error: any) {
    console.error(`[Daily Job] Error checking goals: ${error.message}`);
  }
}

/**
 * Verificar alertas customizáveis
 */
async function checkCustomAlerts() {
  console.log("[Daily Job] Checking custom alerts...");

  try {
    const dbInstance = await db.getDb();
    if (!dbInstance) return;
    
    const usersData = await dbInstance.select().from(users);
    const farms = usersData.map((u: any) => ({ id: u.id, userId: u.id }));

    for (const farm of farms) {
      // Buscar alertas ativos desta fazenda
      const alerts = await db.getAlertsByFarmId(farm.id);
      const activeAlerts = alerts.filter((a: any) => a.isActive);

      for (const alert of activeAlerts) {
        let currentValue: number | null = null;
        const threshold = parseFloat(alert.threshold);

        // Buscar valor atual baseado no tipo de alerta
        switch (alert.type) {
          case "gmd": {
            // Calcular GMD médio de todos os animais
            const animals = await db.getAnimalsByFarmId(farm.id);
            const gmds = animals.map((a: any) => a.gmd).filter((g: any) => g !== null);
            if (gmds.length > 0) {
              currentValue = gmds.reduce((sum: number, g: number) => sum + g, 0) / gmds.length;
            }
            break;
          }
          case "stock": {
            // Verificar estoque baixo
            const lowStockItems = await db.getLowStockItems(farm.id);
            currentValue = lowStockItems.length;
            break;
          }
          case "expense": {
            // Calcular despesas do mês atual
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const summary = await db.getFinancialSummary(farm.id, startOfMonth, endOfMonth);
            currentValue = summary.expense;
            break;
          }
          case "milk": {
            // Calcular produção de leite do mês atual
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const production = await db.getMilkProductionByFarmId(farm.id, startOfMonth, endOfMonth);
            currentValue = production.reduce((sum: number, p: any) => sum + p.liters, 0);
            break;
          }
        }

        // Verificar se a condição do alerta foi atingida
        if (currentValue !== null) {
          let conditionMet = false;

          switch (alert.condition) {
            case "below":
              conditionMet = currentValue < threshold;
              break;
            case "above":
              conditionMet = currentValue > threshold;
              break;
            case "equal":
              conditionMet = Math.abs(currentValue - threshold) < 0.01;
              break;
          }

          if (conditionMet) {
            // Enviar notificação
            await db.createNotification({
              userId: farm.userId,
              type: "other",
              title: `Alerta: ${alert.name}`,
              message: `O valor atual (${currentValue.toFixed(2)}) está ${alert.condition === "below" ? "abaixo de" : alert.condition === "above" ? "acima de" : "igual a"} ${threshold}`,
              read: false,
            });
            console.log(`[Daily Job] Custom alert triggered: ${alert.name} for farm ${farm.id}`);
          }
        }
      }
    }

    console.log("[Daily Job] Custom alerts check completed");
  } catch (error: any) {
    console.error(`[Daily Job] Error checking custom alerts: ${error.message}`);
  }
}

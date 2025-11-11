import * as db from "../db";
import { users } from "../../drizzle/schema";
import {
  notifyVaccinationAlert,
  notifyPendingTask,
  notifyLowStock,
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

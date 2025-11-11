import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Local authentication routes for development without Manus OAuth
 */
export function registerLocalAuthRoutes(app: Express) {
  // Página de login local
  app.get("/api/auth/local-login", (req: Request, res: Response) => {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Local - Oryum Tauros</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 100%;
    }
    h1 {
      color: #16a34a;
      margin-bottom: 10px;
      font-size: 28px;
      text-align: center;
    }
    p {
      color: #6b7280;
      margin-bottom: 30px;
      text-align: center;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: #374151;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #22c55e;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
    }
    button {
      width: 100%;
      padding: 14px;
      background: #22c55e;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover {
      background: #16a34a;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
    }
    button:active {
      transform: translateY(0);
    }
    .hint {
      margin-top: 20px;
      padding: 12px;
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      border-radius: 8px;
      font-size: 13px;
      color: #16a34a;
    }
    .role-select {
      margin-top: 15px;
    }
    select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
      background: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🐄 Oryum Tauros</h1>
    <p>Login Local de Desenvolvimento</p>
    
    <form action="/api/auth/local-login" method="POST">
      <div class="form-group">
        <label for="name">Nome</label>
        <input type="text" id="name" name="name" value="Kalleby" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="kalleby@oryum.com" required>
      </div>
      
      <div class="form-group role-select">
        <label for="role">Perfil</label>
        <select id="role" name="role">
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      
      <button type="submit">Entrar no Sistema</button>
    </form>
    
    <div class="hint">
      💡 <strong>Modo de desenvolvimento:</strong> Este login é apenas para testes locais. Em produção, use autenticação real.
    </div>
  </div>
</body>
</html>
    `;
    
    res.send(html);
  });

  // Processar login local
  app.post("/api/auth/local-login", async (req: Request, res: Response) => {
    try {
      const { name, email, role = "user" } = req.body;

      if (!name || !email) {
        res.status(400).send("Nome e email são obrigatórios");
        return;
      }

      // Criar um openId fake único baseado no email
      const openId = `local_${Buffer.from(email).toString('base64')}`;

      // Criar ou atualizar usuário no banco
      await db.upsertUser({
        openId,
        name,
        email,
        loginMethod: "local",
        role: role as "user" | "admin",
        lastSignedIn: new Date(),
      });

      console.log(`[Local Auth] User logged in: ${name} (${email}) as ${role}`);

      // Em modo development, criar assinatura FREE automaticamente
      if (process.env.NODE_ENV === 'development') {
        try {
          const existingSubscription = await db.getSubscriptionByUserId(
            (await db.getUserByOpenId(openId))?.id || 0
          );
          
          if (!existingSubscription) {
            const userId = (await db.getUserByOpenId(openId))?.id;
            if (userId) {
              await db.createSubscription({
                userId,
                planId: 'professional',
                stripePriceId: 'dev_free_price',
                status: 'active',
                stripeSubscriptionId: `dev_free_${userId}`,
                stripeCustomerId: `dev_customer_${userId}`,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
              });
              console.log(`[Local Auth] FREE subscription created for user ${userId}`);
            }
          }
        } catch (error) {
          console.log('[Local Auth] Could not create free subscription:', error);
        }
      }

      // Criar sessão
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS 
      });

      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[Local Auth] Login failed", error);
      res.status(500).send("Erro ao fazer login");
    }
  });
}

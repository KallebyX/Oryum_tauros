# Guia de Configuração Stripe - Oryum Tauros

Este guia detalha o processo completo de configuração da integração Stripe para o sistema Oryum Tauros, incluindo criação de produtos, configuração de webhooks e testes.

---

## 📋 Pré-requisitos

Antes de começar, você precisará:

1. **Conta Stripe** - Criar conta em [stripe.com](https://stripe.com)
2. **Acesso ao Dashboard** - Login em [dashboard.stripe.com](https://dashboard.stripe.com)
3. **Chaves API** - Disponíveis em Developers → API keys

---

## 🛍️ Passo 1: Criar Produtos no Stripe

### 1.1 Acessar Catálogo de Produtos

1. Faça login no [Dashboard Stripe](https://dashboard.stripe.com)
2. No menu lateral, clique em **Product catalog** (Catálogo de produtos)
3. Clique no botão **+ Add product** (Adicionar produto)

### 1.2 Criar Plano Básico

**Informações do Produto:**
- **Name**: Oryum Tauros - Plano Básico
- **Description**: Ideal para pequenos produtores começando a digitalizar. Inclui gestão financeira, controle de estoque e até 50 animais cadastrados.
- **Image**: (Opcional) Upload do logo do Oryum Tauros

**Configuração de Preço:**
- **Pricing model**: Standard pricing
- **Price**: R$ 49,00
- **Billing period**: Monthly (Mensal)
- **Currency**: BRL (Real Brasileiro)
- **Price description**: Plano Básico - Mensal

Clique em **Save product** e **copie o Price ID** (formato: `price_xxxxxxxxxxxxx`)

### 1.3 Criar Plano Profissional

**Informações do Produto:**
- **Name**: Oryum Tauros - Plano Profissional
- **Description**: Para produtores que buscam crescimento sustentável. Inclui tudo do Básico + gestão individual de animais com GMD, métricas ESG, gamificação e recomendações IA.

**Configuração de Preço:**
- **Price**: R$ 99,00
- **Billing period**: Monthly
- **Currency**: BRL

Clique em **Save product** e **copie o Price ID**

### 1.4 Criar Plano Empresarial

**Informações do Produto:**
- **Name**: Oryum Tauros - Plano Empresarial
- **Description**: Solução completa para grandes propriedades. Inclui tudo do Profissional + animais ilimitados, ranking, relatórios avançados, manejo reprodutivo completo e suporte 24/7.

**Configuração de Preço:**
- **Price**: R$ 199,00
- **Billing period**: Monthly
- **Currency**: BRL

Clique em **Save product** e **copie o Price ID**

---

## 🔑 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Obter Chaves API

1. No Dashboard Stripe, vá para **Developers** → **API keys**
2. Copie a **Secret key** (começa com `sk_test_` para teste ou `sk_live_` para produção)
3. Copie a **Publishable key** (começa com `pk_test_` ou `pk_live_`)

### 2.2 Obter Webhook Secret

1. Vá para **Developers** → **Webhooks**
2. Clique em **+ Add endpoint**
3. **Endpoint URL**: `https://seu-dominio.manus.space/api/stripe/webhook`
4. **Events to send**: Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Clique em **Add endpoint**
6. Copie o **Signing secret** (começa com `whsec_`)

### 2.3 Atualizar Variáveis no Manus

No painel de gerenciamento do Manus, vá para **Settings** → **Secrets** e adicione/atualize:

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_BASIC=price_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

**⚠️ Importante:** Após adicionar as variáveis, reinicie o servidor para aplicar as mudanças.

---

## 🎟️ Passo 3: Criar Cupons de Desconto (Opcional)

### 3.1 Acessar Cupons

1. No Dashboard Stripe, vá para **Products** → **Coupons**
2. Clique em **+ Create coupon**

### 3.2 Tipos de Cupons

**Cupom de Porcentagem:**
- **Name**: PRIMEIROANO20
- **Type**: Percentage discount
- **Percent off**: 20%
- **Duration**: Forever / Once / Repeating
- **Applies to**: All products

**Cupom de Valor Fixo:**
- **Name**: DESCONTO50
- **Type**: Fixed amount
- **Amount off**: R$ 50,00
- **Currency**: BRL
- **Duration**: Once

**Cupom de Trial Gratuito:**
- **Name**: TRIAL30DIAS
- **Type**: Free trial
- **Duration**: 30 days

### 3.3 Configurações Avançadas

- **Redemption limits**: Limite de uso (ex: 100 vezes)
- **Expiration date**: Data de expiração
- **Customer eligibility**: Todos ou clientes específicos

### 3.4 Usar Cupons no Sistema

1. Usuário acessa `/pricing`
2. Insere código do cupom no campo "Tem um cupom de desconto?"
3. Código é validado automaticamente no checkout Stripe
4. Desconto aplicado na primeira cobrança (ou conforme configuração)

**⚠️ Importante:** O sistema envia o código do cupom para o Stripe, que valida automaticamente. Não é necessário validação manual no backend.

---

## 🧪 Passo 4: Testar Fluxo de Pagamento

### 3.1 Cartões de Teste

Use os seguintes cartões de teste do Stripe:

| Cenário | Número do Cartão | CVC | Data | CEP |
|---------|------------------|-----|------|-----|
| **Pagamento bem-sucedido** | 4242 4242 4242 4242 | Qualquer 3 dígitos | Qualquer data futura | Qualquer |
| **Pagamento recusado** | 4000 0000 0000 0002 | Qualquer 3 dígitos | Qualquer data futura | Qualquer |
| **Requer autenticação (3D Secure)** | 4000 0025 0000 3155 | Qualquer 3 dígitos | Qualquer data futura | Qualquer |
| **Cartão expirado** | 4000 0000 0000 0069 | Qualquer 3 dígitos | Qualquer data futura | Qualquer |

### 3.2 Fluxo de Teste Completo

1. **Acesse a página de Pricing**: `https://seu-dominio.manus.space/pricing`
2. **Faça login** no sistema
3. **Clique em "Assinar"** em qualquer plano
4. **Preencha o formulário** do Stripe com um cartão de teste
5. **Complete o pagamento**
6. **Verifique o redirecionamento** para `/pricing?success=true`
7. **Confirme no Dashboard Stripe** que a assinatura foi criada
8. **Verifique no banco de dados** se o registro foi salvo na tabela `subscriptions`

### 3.3 Verificar Webhook

1. No Dashboard Stripe, vá para **Developers** → **Webhooks**
2. Clique no endpoint configurado
3. Verifique a aba **Events** para ver os eventos recebidos
4. Confirme que todos retornam **200 OK**

---

## 🔄 Passo 5: Migrar para Produção

### 4.1 Ativar Modo Produção no Stripe

1. Complete o processo de verificação da conta Stripe
2. Ative o modo produção no Dashboard
3. Crie os mesmos 3 produtos no modo produção
4. Obtenha as novas chaves de produção (`sk_live_` e `pk_live_`)

### 4.2 Atualizar Variáveis de Produção

Substitua todas as chaves `test` por chaves `live` nas variáveis de ambiente:

```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx (novo webhook de produção)
VITE_STRIPE_PRICE_BASIC=price_xxxxxxxxxxxxx (novo price_id de produção)
VITE_STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

### 4.3 Configurar Webhook de Produção

1. Crie um novo webhook endpoint para produção
2. URL: `https://seu-dominio-producao.manus.space/api/stripe/webhook`
3. Selecione os mesmos eventos
4. Copie o novo **Signing secret** de produção

---

## 📊 Passo 6: Monitoramento e Manutenção

### Verificar Assinaturas Ativas

```sql
SELECT 
  u.name as usuario,
  s.planId as plano,
  s.status,
  s.currentPeriodEnd as proxima_cobranca
FROM subscriptions s
JOIN users u ON s.userId = u.id
WHERE s.status = 'active'
ORDER BY s.currentPeriodEnd;
```

### Logs do Webhook

Os logs do webhook estão disponíveis no console do servidor:
- `[Stripe Webhook] Received event: checkout.session.completed`
- `[Stripe Webhook] Subscription created for farm X, plan: basic`

### Métricas Importantes

Monitore no Dashboard Stripe:
- **MRR (Monthly Recurring Revenue)**: Receita recorrente mensal
- **Churn Rate**: Taxa de cancelamento
- **LTV (Lifetime Value)**: Valor do tempo de vida do cliente
- **Payment Success Rate**: Taxa de sucesso de pagamentos

---

## 🆘 Passo 7: Troubleshooting

### Problema: Cupom não aplicado

**Solução**: Verifique se o código do cupom está correto (case-sensitive) e se não expirou no Dashboard Stripe.

### Problema: Webhook retorna erro 400

**Solução**: Verifique se o `STRIPE_WEBHOOK_SECRET` está correto nas variáveis de ambiente.

### Problema: Checkout não redireciona

**Solução**: Confirme que as URLs de sucesso e cancelamento estão corretas no código.

### Problema: Assinatura não aparece no banco

**Solução**: Verifique os logs do webhook e confirme que o evento `checkout.session.completed` foi processado.

### Problema: Cartão de teste recusado

**Solução**: Use o cartão `4242 4242 4242 4242` para testes bem-sucedidos.

---

## 📞 Suporte

- **Documentação Stripe**: [docs.stripe.com](https://docs.stripe.com)
- **Suporte Stripe**: [support.stripe.com](https://support.stripe.com)
- **Status Stripe**: [status.stripe.com](https://status.stripe.com)

---

## ✅ Checklist Final

- [ ] Produtos criados no Stripe (Básico, Profissional, Empresarial)
- [ ] Price IDs copiados e salvos
- [ ] Chaves API configuradas nas variáveis de ambiente
- [ ] Webhook configurado com URL correta
- [ ] Webhook secret adicionado às variáveis
- [ ] Teste com cartão 4242 realizado com sucesso
- [ ] Assinatura criada no banco de dados
- [ ] Webhook retornando 200 OK
- [ ] Página de pricing mostrando planos corretamente
- [ ] Redirecionamento pós-pagamento funcionando
- [ ] Cupons de desconto criados (opcional)
- [ ] Teste com cupom realizado (opcional)
- [ ] Customer Portal configurado para gerenciar assinaturas

---

**Última atualização**: Novembro 2025  
**Versão**: 1.0  
**Autor**: Equipe Oryum Tauros

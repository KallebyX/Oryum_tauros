# Oryum Tauros - TODO List Completo

## Fase 1: Schema do Banco de Dados
- [x] Criar tabela de fazendas (farms) com região, tamanho, número de animais
- [x] Criar tabela de lotes (batches) por tipo e fase produtiva
- [x] Criar tabela de animais individuais com rastreabilidade (RFID/brinco)
- [x] Criar tabela de transações financeiras (vendas/compras)
- [x] Criar tabela de estoque (ração, medicamentos, insumos)
- [x] Criar tabela de checklist ESG com pontuação
- [x] Criar tabela de respostas ESG
- [x] Criar tabela de selos (Bronze/Prata/Ouro)
- [x] Criar tabela de desafios e missões
- [x] Criar tabela de progresso de desafios
- [x] Criar tabela de recomendações IA
- [x] Criar tabelas de manejo reprodutivo (cio, IA, prenhez, parto)
- [x] Criar tabelas de manejo sanitário (vacinas, vermífugos)
- [x] Criar tabelas de pastagens e suplementação
- [x] Criar tabela de pesagens para cálculo de GMD
- [x] Criar tabela de produção de leite
- [x] Executar migrations do banco

## Fase 2: Backend - Endpoints tRPC
- [x] Implementar routers tRPC completos
- [ ] Implementar CRUD de fazendas
- [ ] Implementar CRUD de transações financeiras
- [ ] Implementar CRUD de estoque com alertas
- [ ] Implementar CRUD de lotes
- [ ] Implementar CRUD de animais individuais
- [ ] Implementar registro de pesagens e cálculo de GMD
- [ ] Implementar registro de produção de leite
- [ ] Implementar endpoints de checklist ESG
- [ ] Implementar cálculo automático de score ESG
- [ ] Implementar sistema de selos (Bronze ≥30, Prata ≥60, Ouro ≥90)
- [ ] Implementar CRUD de desafios
- [ ] Implementar progresso e completação de desafios
- [ ] Implementar ranking por região e nacional
- [ ] Implementar dashboard com KPIs agregados
- [ ] Implementar manejo reprodutivo (cio, IA, prenhez, parto)
- [ ] Implementar calendário sanitário com alertas
- [ ] Implementar gestão de pastagens e rotacionamento
- [ ] Implementar controle de suplementação
- [ ] Implementar exportação de relatórios (PDF/CSV)

## Fase 3: Landing Page e Onboarding
- [x] Criar landing page profissional com tema verde agricultura
- [x] Implementar seção hero com CTA
- [x] Criar seção de features destacando módulos
- [x] Adicionar seção de benefícios e estatísticas
- [ ] Implementar página de pricing com Stripe
- [x] Criar página de onboarding para configuração inicial
- [x] Implementar formulário de cadastro de fazenda com validação
- [x] Adicionar redirecionamento automático para dashboard

## Fase 4: Dashboard e Módulos de Gestão
- [x] Instalar biblioteca Recharts
- [x] Criar dashboard principal com KPIs financeiros e ESG
- [x] Implementar gráficos de tendência (Recharts)
- [x] Criar módulo de gestão financeira completo
- [x] Implementar lista de transações com filtros
- [x] Criar formulário para adicionar nova transação
- [x] Adicionar cards de resumo mensal
- [x] Criar módulo de gestão de estoque
- [x] Implementar cards de itens com alertas visuais
- [x] Criar formulário para adicionar/atualizar itens
- [x] Adicionar histórico de movimentações
- [ ] Criar módulo de planejamento e agenda
- [ ] Criar página de gestão de animais individuais
- [ ] Criar página de registro de pesagens
- [ ] Criar página de produção de leite
- [ ] Criar página de manejo reprodutivo
- [ ] Criar página de calendário sanitário
- [ ] Criar página de gestão de pastagens
- [ ] Implementar alertas e notificações

## Fase 5: ESG, Gamificação e IA
- [ ] Criar página de checklist ESG interativo
- [ ] Implementar sistema de pontuação visual
- [ ] Criar página de selos e conquistas
- [ ] Implementar página de desafios mensais
- [ ] Criar página de ranking com filtros
- [ ] Implementar motor de IA para recomendações
- [ ] Implementar sumarização de relatórios
- [ ] Implementar sugestões para melhorar selo
- [ ] Integrar com OpenAI API

## Fase 6: Finalização e Testes
- [ ] Criar dados de seed completos
- [ ] Testar todos os fluxos principais
- [ ] Verificar responsividade mobile
- [ ] Validar cálculos de GMD, ICA, scores ESG
- [ ] Testar integração Stripe
- [ ] Criar documentação do projeto
- [ ] Criar checkpoint final funcional


## Correções e Novas Funcionalidades
- [x] Corrigir erros TypeScript de farmId em Financial.tsx
- [x] Corrigir erros TypeScript de farmId em Inventory.tsx
- [x] Corrigir erro de useState duplicado em Onboarding.tsx
- [x] Implementar módulo de Planejamento (/planning)
- [x] Criar lista de tarefas com categorização (vacinação, pesagem, manejo)
- [x] Adicionar filtros por status (pendente/concluída/atrasada)
- [x] Criar formulário para adicionar novas tarefas com data e prioridade
- [x] Adicionar alertas visuais para tarefas atrasadas
- [x] Implementar página de Gestão de Animais (/animals)
- [x] Criar tabela de animais individuais
- [x] Adicionar modal para registrar nova pesagem
- [x] Implementar cálculo automático de GMD
- [x] Criar página de Pricing (/pricing)
- [x] Adicionar cards dos 3 planos com preços
- [x] Integrar botões de checkout com Stripe
- [x] Adicionar indicador visual do plano atual
- [ ] Testar todas as funcionalidades

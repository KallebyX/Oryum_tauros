# Oryum Tauros - ERP Rural Inteligente

**Sistema completo de gestão para produtores rurais** que integra controle financeiro, rastreabilidade animal, métricas ESG, gamificação e inteligência artificial para recomendações personalizadas.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Guia de Uso](#guia-de-uso)
- [Testes](#testes)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🌱 Sobre o Projeto

O **Oryum Tauros** é uma plataforma ERP (Enterprise Resource Planning) desenvolvida especificamente para o setor agropecuário brasileiro. O sistema oferece uma solução completa para gestão de fazendas, combinando tecnologia moderna com as necessidades práticas dos produtores rurais.

### Diferenciais

O Oryum Tauros se destaca por integrar em uma única plataforma funcionalidades que normalmente exigiriam múltiplos sistemas:

**Gestão Integrada**: Todos os aspectos da fazenda em um só lugar, desde finanças até manejo animal, eliminando a necessidade de planilhas dispersas e sistemas incompatíveis.

**Inteligência Artificial**: Motor de IA que analisa os dados da fazenda e gera recomendações personalizadas para melhorar produtividade, reduzir custos e otimizar o manejo.

**Sustentabilidade Mensurável**: Sistema completo de métricas ESG (Environmental, Social, Governance) com checklist interativo, cálculo automático de score e badges de certificação (Bronze, Prata, Ouro), permitindo que produtores demonstrem suas práticas sustentáveis e acessem mercados premium.

**Gamificação Engajadora**: Desafios mensais com sistema de pontos e ranking regional/nacional, transformando boas práticas em competição saudável e incentivando a melhoria contínua.

**Rastreabilidade Completa**: Cada animal possui histórico detalhado de pesagens, vacinações, eventos reprodutivos e produção, com cálculo automático de GMD (Ganho Médio Diário) e alertas proativos.

---

## ✨ Funcionalidades Principais

### 1. Dashboard Executivo

O dashboard oferece visão consolidada de toda a operação com KPIs em tempo real, gráficos interativos de desempenho financeiro e produtivo, alertas de tarefas pendentes e vacinações próximas, e seção dedicada mostrando as 3 metas mais próximas do prazo com barras de progresso visual.

### 2. Gestão Financeira

Sistema completo de controle de receitas e despesas com categorização automática, cálculo de saldo e lucro líquido, gráficos de evolução mensal, e exportação de relatórios em PDF e Excel para análises detalhadas.

### 3. Gestão de Animais

Cadastro individual de animais com RFID e brinco, registro de pesagens com cálculo automático de GMD, histórico completo de manejo (vacinações, reprodução, produção de leite), e alertas automáticos de eventos importantes.

### 4. Manejo Reprodutivo

Controle de eventos reprodutivos incluindo cio, inseminação, gestação e parto, estatísticas de desempenho reprodutivo do rebanho, e alertas de datas importantes para maximizar a eficiência reprodutiva.

### 5. Calendário Sanitário

Registro completo de vacinações e tratamentos veterinários, alertas automáticos de próximas doses (7 dias de antecedência), histórico de saúde por animal, e controle de lotes de vacinas.

### 6. Gestão de Pastagens

Cadastro de pastagens com área e tipo de capim, sistema de rotação com controle de status (ativa, descanso, renovação), datas de entrada e saída de lotes, e planejamento de manejo de pastagens.

### 7. Produção de Leite

Registro diário de produção por animal, cálculo automático de médias e totais, gráficos de evolução de produção, e identificação de animais com melhor desempenho.

### 8. Planejamento e Tarefas

Sistema de tarefas com categorização (vacinação, manejo reprodutivo, manutenção, alimentação), filtros por status (pendente, concluída, atrasada), alertas visuais para tarefas atrasadas, e notificações automáticas.

### 9. Métricas ESG

Checklist interativo com 16 práticas sustentáveis divididas em categorias ambientais, sociais e de governança, cálculo automático de score ESG, badges de certificação (Bronze ≥60%, Prata ≥75%, Ouro ≥90%), e relatórios detalhados de práticas implementadas.

### 10. Sistema de Gamificação

Desafios mensais com objetivos específicos (produtividade, sustentabilidade, eficiência), sistema de pontos e conquistas, ranking regional e nacional com Top 10, e notificações de conquistas para engajar produtores.

### 11. Sistema de Metas

Criação de metas personalizadas (produção de leite, GMD, score ESG, receita, redução de despesas), acompanhamento visual de progresso com barras e percentuais, alertas automáticos quando meta é atingida ou faltam 7 dias para o prazo, e integração com dashboard principal.

### 12. Notificações Inteligentes

Job agendado rodando diariamente às 8h verificando vacinações próximas, tarefas pendentes, estoque baixo e progresso de metas, sistema de notificações em tempo real integrado ao Manus, histórico completo de notificações com filtros por tipo, e badge de contagem no sino do header.

### 13. Relatórios e Exportação

Geração de relatórios em PDF com gráficos (financeiro, ESG, produção), exportação de dados em Excel para análises customizadas, relatórios mensais e anuais automatizados, e visualizações de dados interativas.

### 14. Inteligência Artificial

Motor de IA com três funcionalidades principais: recomendações gerais analisando dados da fazenda e gerando 3-5 sugestões práticas, sugestões ESG específicas para melhorar o score com indicação de impacto esperado, e resumo de desempenho com análise de KPIs e identificação de pontos fortes e áreas de atenção.

### 15. Planos de Assinatura

Três planos disponíveis: Básico (R$ 49/mês) para pequenos produtores com funcionalidades essenciais, Profissional (R$ 99/mês) para médios produtores com recursos avançados de IA e relatórios, e Empresarial (R$ 199/mês) para grandes operações com suporte prioritário e integrações customizadas. Integração completa com Stripe para pagamentos seguros.

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

O Oryum Tauros utiliza uma arquitetura moderna full-stack com separação clara entre frontend e backend:

**Frontend**: React 19 com TypeScript para type safety, Tailwind CSS 4 para estilização responsiva, shadcn/ui para componentes de interface consistentes, tRPC React Query para comunicação type-safe com backend, Wouter para roteamento leve, e Recharts para visualizações de dados.

**Backend**: Node.js 22 com Express 4, tRPC 11 para APIs type-safe end-to-end, Drizzle ORM para acesso ao banco de dados, SuperJSON para serialização de tipos complexos (Date, BigInt), e autenticação OAuth via Manus.

**Banco de Dados**: MySQL/TiDB com schema gerenciado pelo Drizzle ORM, migrações automáticas via `pnpm db:push`, e 20+ tabelas relacionadas cobrindo todos os módulos do sistema.

**Infraestrutura**: Vite para build e hot reload, TSX para execução de TypeScript no servidor, job agendado com node-cron para notificações diárias, e integração com serviços Manus (storage S3, notificações, IA).

### Fluxo de Dados

O sistema segue um padrão de arquitetura em camadas bem definido:

**Camada de Apresentação (Frontend)**: Componentes React consomem dados via hooks do tRPC (`useQuery`, `useMutation`), estado local gerenciado com React hooks, e atualização otimista de UI para melhor experiência.

**Camada de API (tRPC Routers)**: Routers organizados por domínio (auth, batches, financial, animals, etc.), procedures públicas e protegidas com middleware de autenticação, validação de entrada com Zod schemas, e retorno de dados tipados automaticamente.

**Camada de Negócio (Database Helpers)**: Funções em `server/db.ts` encapsulam lógica de acesso a dados, queries otimizadas com Drizzle ORM, e cálculos complexos (GMD, score ESG, progresso de metas).

**Camada de Persistência (Banco de Dados)**: Schema definido em `drizzle/schema.ts`, relacionamentos entre tabelas bem definidos, e índices para performance.

### Segurança

O sistema implementa múltiplas camadas de segurança:

**Autenticação**: OAuth via Manus com tokens JWT, sessões gerenciadas via cookies HTTP-only, e middleware de autenticação em todas as rotas protegidas.

**Autorização**: Sistema de roles (admin/user) para controle de acesso, verificação de ownership de recursos (usuário só acessa dados da própria fazenda), e procedures específicas para operações administrativas.

**Dados Sensíveis**: Variáveis de ambiente para secrets (Stripe, banco de dados, API keys), comunicação HTTPS obrigatória, e sanitização de inputs para prevenir SQL injection.

---

## 🛠️ Tecnologias Utilizadas

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 19.x | Biblioteca para interfaces de usuário |
| TypeScript | 5.x | Superset JavaScript com tipagem estática |
| Tailwind CSS | 4.x | Framework CSS utility-first |
| shadcn/ui | Latest | Componentes React acessíveis e customizáveis |
| tRPC Client | 11.x | Cliente type-safe para APIs |
| Wouter | 3.x | Roteador React minimalista |
| Recharts | 2.x | Biblioteca de gráficos para React |
| Lucide React | Latest | Ícones SVG otimizados |

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Node.js | 22.x | Runtime JavaScript server-side |
| Express | 4.x | Framework web minimalista |
| tRPC | 11.x | APIs type-safe end-to-end |
| Drizzle ORM | Latest | ORM TypeScript-first |
| MySQL/TiDB | 8.x | Banco de dados relacional |
| SuperJSON | Latest | Serialização de tipos complexos |
| PDFKit | Latest | Geração de PDFs |
| Chart.js | 4.x | Gráficos para relatórios |
| node-cron | 3.x | Agendamento de jobs |
| Stripe | Latest | Processamento de pagamentos |

### Ferramentas de Desenvolvimento

| Ferramenta | Descrição |
|------------|-----------|
| Vite | Build tool e dev server |
| TSX | Execução de TypeScript |
| ESLint | Linter para JavaScript/TypeScript |
| Prettier | Formatador de código |
| Git | Controle de versão |
| GitHub | Hospedagem de repositório |
| Manus Platform | Deploy e infraestrutura |

---

## 📦 Instalação e Configuração

### Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- Node.js 22.x ou superior
- pnpm 9.x ou superior (gerenciador de pacotes)
- MySQL 8.x ou TiDB (banco de dados)
- Git para controle de versão

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/KallebyX/Oryum_tauros.git
cd Oryum_tauros
```

### Passo 2: Instalar Dependências

```bash
pnpm install
```

Este comando instalará todas as dependências do frontend e backend listadas no `package.json`.

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias (veja seção [Variáveis de Ambiente](#variáveis-de-ambiente) para detalhes).

### Passo 4: Configurar Banco de Dados

Execute o comando para criar as tabelas no banco de dados:

```bash
pnpm db:push
```

Este comando usa o Drizzle ORM para sincronizar o schema definido em `drizzle/schema.ts` com o banco de dados.

### Passo 5: Popular Dados Iniciais (Opcional)

Para popular o banco com dados de exemplo (checklists ESG e desafios):

```bash
npx tsx server/seed.mjs
```

### Passo 6: Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`.

---

## 🔐 Variáveis de Ambiente

O sistema utiliza as seguintes variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto:

### Banco de Dados

```env
DATABASE_URL=mysql://usuario:senha@host:3306/nome_banco
```

Conexão com MySQL ou TiDB. Formato: `mysql://[usuario]:[senha]@[host]:[porta]/[database]`

### Autenticação (Manus OAuth)

```env
JWT_SECRET=sua_chave_secreta_jwt_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=seu_app_id_manus
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome
```

Configurações de autenticação OAuth via Manus Platform. O `JWT_SECRET` deve ser uma string aleatória segura.

### Stripe (Pagamentos)

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_BASIC=price_...
VITE_STRIPE_PRICE_PROFESSIONAL=price_...
VITE_STRIPE_PRICE_ENTERPRISE=price_...
```

Chaves da API Stripe para processar pagamentos. Use chaves de teste (`sk_test_`, `pk_test_`) em desenvolvimento e chaves de produção (`sk_live_`, `pk_live_`) em produção. Os `price_` são IDs dos produtos criados no Stripe Dashboard.

### Manus Built-in APIs

```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api_manus
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend
```

APIs internas do Manus para storage S3, notificações, IA e outros serviços.

### Aplicação

```env
VITE_APP_TITLE=Oryum Tauros - ERP Rural Inteligente
VITE_APP_LOGO=/logo.svg
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
```

Configurações gerais da aplicação. O `VITE_APP_LOGO` deve apontar para um arquivo em `client/public/`.

---

## 📁 Estrutura de Pastas

```
oryum-tauros/
├── client/                    # Frontend React
│   ├── public/               # Arquivos estáticos (logo, favicon)
│   └── src/
│       ├── pages/           # Páginas da aplicação (20 páginas)
│       ├── components/      # Componentes reutilizáveis
│       │   ├── ui/         # Componentes shadcn/ui
│       │   ├── DashboardLayout.tsx
│       │   ├── NotificationBell.tsx
│       │   └── Map.tsx
│       ├── contexts/        # Contextos React (Theme, Auth)
│       ├── hooks/           # Custom hooks
│       ├── lib/             # Utilitários e configurações
│       │   └── trpc.ts     # Cliente tRPC
│       ├── const.ts         # Constantes da aplicação
│       ├── App.tsx          # Configuração de rotas
│       ├── main.tsx         # Entry point
│       └── index.css        # Estilos globais e tema
│
├── server/                   # Backend Node.js
│   ├── _core/               # Infraestrutura e configurações
│   │   ├── index.ts        # Servidor Express
│   │   ├── trpc.ts         # Configuração tRPC
│   │   ├── context.ts      # Contexto de requisições
│   │   ├── env.ts          # Variáveis de ambiente
│   │   ├── cookies.ts      # Gerenciamento de cookies
│   │   ├── llm.ts          # Integração com IA
│   │   ├── stripe.ts       # Integração Stripe
│   │   ├── notifications.ts # Sistema de notificações
│   │   ├── pdfReports.ts   # Geração de relatórios PDF
│   │   └── map.ts          # Integração Google Maps
│   ├── routers.ts           # Routers tRPC (15 routers)
│   ├── db.ts                # Funções de acesso a dados
│   ├── jobs/                # Jobs agendados
│   │   └── dailyNotifications.ts
│   ├── webhooks/            # Webhooks externos
│   │   └── stripe.ts
│   └── reports/             # Endpoints de relatórios
│       └── index.ts
│
├── drizzle/                  # Schema e migrações
│   └── schema.ts            # Definição de tabelas (20+ tabelas)
│
├── shared/                   # Código compartilhado
│   └── const.ts             # Constantes compartilhadas
│
├── storage/                  # Helpers S3
│   └── index.ts
│
├── .env                      # Variáveis de ambiente (não versionado)
├── package.json              # Dependências e scripts
├── tsconfig.json             # Configuração TypeScript
├── vite.config.ts            # Configuração Vite
├── tailwind.config.ts        # Configuração Tailwind
└── README.md                 # Este arquivo
```

### Páginas Implementadas

O sistema possui 20 páginas completas:

1. **Home** (`/`) - Landing page com apresentação do sistema
2. **Dashboard** (`/dashboard`) - Visão geral com KPIs e metas
3. **Onboarding** (`/onboarding`) - Cadastro inicial da fazenda
4. **Financial** (`/financial`) - Gestão financeira
5. **Inventory** (`/inventory`) - Controle de estoque
6. **Planning** (`/planning`) - Planejamento e tarefas
7. **Animals** (`/animals`) - Gestão de animais
8. **MilkProduction** (`/milk-production`) - Produção de leite
9. **Reproduction** (`/reproduction`) - Manejo reprodutivo
10. **Health** (`/health`) - Calendário sanitário
11. **Pastures** (`/pastures`) - Gestão de pastagens
12. **ESG** (`/esg`) - Métricas de sustentabilidade
13. **Challenges** (`/challenges`) - Desafios e gamificação
14. **Ranking** (`/ranking`) - Ranking de produtores
15. **Goals** (`/goals`) - Sistema de metas
16. **Pricing** (`/pricing`) - Planos de assinatura
17. **Reports** (`/reports`) - Geração de relatórios
18. **Notifications** (`/notifications`) - Histórico de notificações
19. **ComponentShowcase** (`/showcase`) - Showcase de componentes
20. **NotFound** (`/404`) - Página de erro 404

---

## 📖 Guia de Uso

### Primeiro Acesso

Ao acessar o sistema pela primeira vez, você será direcionado para a página de **Onboarding**, onde deverá cadastrar as informações básicas da sua fazenda: nome da propriedade, localização (estado e cidade), área total em hectares, e tipo de produção (gado de corte, gado de leite, misto, ovinos, caprinos).

Após concluir o onboarding, você será redirecionado para o **Dashboard** principal, que apresenta uma visão consolidada de toda a operação.

### Navegação

O sistema utiliza um **DashboardLayout** consistente em todas as páginas internas, com sidebar de navegação à esquerda contendo links para todos os módulos, header no topo com sino de notificações e menu de usuário, e área de conteúdo principal responsiva.

Em dispositivos móveis, a sidebar se transforma em um menu hamburger acessível pelo ícone no canto superior esquerdo.

### Fluxo de Trabalho Recomendado

Para aproveitar ao máximo o sistema, recomendamos o seguinte fluxo:

**Configuração Inicial**: Complete o onboarding, cadastre lotes de animais em `/animals`, configure pastagens em `/pastures`, e adicione itens de estoque em `/inventory`.

**Uso Diário**: Registre transações financeiras conforme ocorrem, atualize pesagens e produção de leite, marque tarefas como concluídas no planejamento, e verifique notificações diariamente.

**Uso Semanal**: Revise o dashboard para acompanhar KPIs, atualize o calendário sanitário com vacinações, registre eventos reprodutivos, e exporte relatórios para análise.

**Uso Mensal**: Complete desafios de gamificação, revise e atualize metas, preencha checklist ESG, e analise relatórios mensais de desempenho.

### Dicas de Produtividade

Maximize sua eficiência com estas dicas:

**Atalhos de Navegação**: Use os cards de "Ações Rápidas" no dashboard para acesso direto às funcionalidades mais usadas.

**Notificações Proativas**: Configure alertas para nunca perder prazos de vacinação ou tarefas importantes. O job diário roda às 8h e envia notificações automáticas.

**Metas Visuais**: Crie metas específicas e acompanhe o progresso diretamente no dashboard, mantendo o foco nos objetivos principais.

**Relatórios Regulares**: Exporte relatórios mensais em PDF para reuniões e análises, ou em Excel para análises customizadas.

**Checklist ESG**: Preencha o checklist ESG regularmente para conquistar badges e demonstrar suas práticas sustentáveis.

---

## 🧪 Testes

### Testes Unitários (Vitest)

O sistema utiliza Vitest para testes unitários de funções críticas:

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Gerar relatório de cobertura
pnpm test:coverage
```

**Funções Testadas**:
- Cálculo de GMD (Ganho Médio Diário)
- Cálculo de score ESG
- Cálculo de progresso de metas
- Validação de dados de entrada
- Formatação de valores monetários

### Testes E2E (Playwright)

Testes end-to-end cobrem fluxos principais do usuário:

```bash
# Executar testes E2E
pnpm test:e2e

# Executar testes E2E em modo UI
pnpm test:e2e:ui
```

**Fluxos Testados**:
- Onboarding completo de nova fazenda
- Criação e edição de animais
- Registro de transações financeiras
- Preenchimento de checklist ESG
- Criação e acompanhamento de metas

### Estrutura de Testes

```
tests/
├── unit/                    # Testes unitários
│   ├── calculations.test.ts
│   ├── validation.test.ts
│   └── formatting.test.ts
└── e2e/                     # Testes E2E
    ├── onboarding.spec.ts
    ├── animals.spec.ts
    ├── financial.spec.ts
    └── esg.spec.ts
```

---

## 🚀 Deploy

### Deploy na Manus Platform

O sistema está otimizado para deploy na Manus Platform:

1. **Criar Checkpoint**: Use o botão "Save Checkpoint" no painel de desenvolvimento
2. **Publicar**: Clique em "Publish" no Management Dashboard
3. **Configurar Domínio**: Acesse Settings → Domains para configurar domínio customizado
4. **Configurar Secrets**: Adicione variáveis de ambiente em Settings → Secrets

### Deploy Manual

Para deploy em outros ambientes:

```bash
# Build do frontend
pnpm build

# Iniciar servidor em produção
NODE_ENV=production pnpm start
```

**Requisitos de Produção**:
- Node.js 22.x ou superior
- MySQL/TiDB configurado e acessível
- Variáveis de ambiente configuradas
- HTTPS obrigatório para OAuth e Stripe
- Certificado SSL válido

### Configurações de Produção

Em produção, certifique-se de:

- Usar chaves Stripe de produção (`sk_live_`, `pk_live_`)
- Configurar webhook Stripe apontando para `https://seu-dominio.com/api/webhooks/stripe`
- Habilitar logs de erro e monitoramento
- Configurar backup automático do banco de dados
- Implementar rate limiting para APIs
- Configurar CDN para assets estáticos

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir com o projeto:

### Processo de Contribuição

1. **Fork o Repositório**: Crie um fork do projeto no GitHub
2. **Clone Localmente**: `git clone https://github.com/seu-usuario/Oryum_tauros.git`
3. **Crie uma Branch**: `git checkout -b feature/sua-funcionalidade`
4. **Faça as Alterações**: Implemente sua funcionalidade ou correção
5. **Teste**: Execute os testes para garantir que nada quebrou
6. **Commit**: `git commit -m "feat: adiciona nova funcionalidade"`
7. **Push**: `git push origin feature/sua-funcionalidade`
8. **Pull Request**: Abra um PR no repositório original

### Padrões de Código

Siga estes padrões ao contribuir:

**TypeScript**: Use tipagem estática sempre que possível, evite `any` exceto quando absolutamente necessário, e prefira interfaces para objetos complexos.

**Componentes React**: Use functional components com hooks, mantenha componentes pequenos e focados, e extraia lógica complexa para custom hooks.

**Estilização**: Use Tailwind CSS para estilos, siga o design system do shadcn/ui, e mantenha classes organizadas (layout → spacing → colors → typography).

**Commits**: Siga o padrão Conventional Commits (feat, fix, docs, style, refactor, test, chore), escreva mensagens descritivas em português, e referencie issues quando aplicável.

### Áreas para Contribuição

Algumas áreas onde contribuições são especialmente bem-vindas:

- **Testes**: Aumentar cobertura de testes unitários e E2E
- **Documentação**: Melhorar documentação de código e guias de uso
- **Acessibilidade**: Melhorar suporte a leitores de tela e navegação por teclado
- **Performance**: Otimizar queries e renderização de componentes
- **Internacionalização**: Adicionar suporte a múltiplos idiomas
- **Integrações**: Adicionar integrações com outros sistemas agropecuários

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

Para suporte, dúvidas ou sugestões:

- **Issues**: Abra uma issue no [GitHub](https://github.com/KallebyX/Oryum_tauros/issues)
- **Email**: contato@oryumtauros.com
- **Documentação**: [docs.oryumtauros.com](https://docs.oryumtauros.com)

---

## 🙏 Agradecimentos

Agradecimentos especiais a:

- **Manus Platform** por fornecer a infraestrutura e ferramentas de desenvolvimento
- **Comunidade Open Source** pelas bibliotecas e frameworks utilizados
- **Produtores Rurais** que inspiraram e validaram as funcionalidades do sistema

---

**Desenvolvido com ❤️ para o agronegócio brasileiro**

*Última atualização: Novembro 2025*

# Treinos API

API RESTful para gerenciamento de treinos e planos de exercícios, com integração de IA para personal trainer virtual.

## 📋 Sobre o Projeto

Treinos API é uma aplicação backend que permite a criação e gerenciamento de planos de treino personalizados. A API oferece funcionalidades para:

- **Autenticação de usuários** com suporte a login social (Google)
- **Criação e gestão de planos de treino** com exercícios estruturados por dia da semana
- **Acompanhamento de sessões de treino** (início e conclusão)
- **Estatísticas e métricas** de desempenho e consistência
- **Personal Trainer Virtual com IA** que cria planos de treino personalizados baseados nos dados do usuário

### Para quem é esta API?

Esta API foi desenvolvida para servir como backend de aplicações de fitness e treino, permitindo que usuários:
- Criem planos de treino semanais personalizados
- Acompanhem sua evolução e consistência
- Recebam recomendações de exercícios através de um assistente de IA

## 🛠️ Tecnologias Utilizadas

### Linguagem e Framework
- **TypeScript** 5.9.3 - Linguagem principal
- **Node.js** 24.x - Runtime
- **Fastify** 5.7.4 - Framework web de alta performance

### Banco de Dados e ORM
- **PostgreSQL** 16 - Banco de dados relacional
- **Prisma** 7.4.0 - ORM e gerenciamento de schema

### Autenticação
- **Better Auth** 1.4.18 - Framework de autenticação completo
- **Google OAuth** - Login social

### Inteligência Artificial
- **Vercel AI SDK** 6.0.100 - Integração com modelos de linguagem
- **Google Generative AI** - Modelo Gemini 2.5 Flash

### Documentação
- **@fastify/swagger** 9.7.0 - Geração automática de OpenAPI/Swagger
- **Scalar API Reference** - Interface de documentação moderna

### Validação
- **Zod** 4.3.6 - Validação de schemas e types

### Utilitários
- **Day.js** - Manipulação de datas
- **dotenv** - Gerenciamento de variáveis de ambiente
- **pino-pretty** - Logger formatado para desenvolvimento

### Ferramentas de Desenvolvimento
- **ESLint** 10.x - Linting de código
- **Prettier** 3.8.1 - Formatação de código
- **tsx** - Execução de TypeScript sem build prévio

## 📁 Estrutura do Projeto

```
treinos-api/
├── src/
│   ├── env/                    # Configuração e validação de variáveis de ambiente
│   ├── errors/                 # Classes de erro personalizadas
│   ├── generated/              # Código gerado pelo Prisma Client
│   ├── lib/                    # Módulos e configurações principais
│   │   ├── auth.ts            # Configuração do Better Auth
│   │   └── db.ts              # Instância do Prisma Client
│   ├── routes/                 # Definição das rotas da API
│   │   ├── ai.ts              # Rotas de chat com IA
│   │   ├── auth.ts            # Rotas de autenticação
│   │   ├── home.ts            # Rotas da página inicial
│   │   ├── me.ts              # Rotas de dados do usuário
│   │   ├── stats.ts           # Rotas de estatísticas
│   │   └── workout-plan.ts    # Rotas de planos de treino
│   ├── schemas/                # Schemas de validação Zod
│   ├── use-cases/              # Regras de negócio e casos de uso
│   │   ├── CreateWorkoutPlan.ts
│   │   ├── GetHomeData.ts
│   │   ├── GetStats.ts
│   │   ├── GetUserTrainData.ts
│   │   ├── GetWorkoutDay.ts
│   │   ├── GetWorkoutPlan.ts
│   │   ├── ListWorkoutPlans.ts
│   │   ├── StartWorkoutSession.ts
│   │   ├── UpdateWorkoutSession.ts
│   │   └── UpsertUserTrainData.ts
│   ├── app.ts                  # Configuração principal do Fastify
│   └── index.ts                # Ponto de entrada da aplicação
├── prisma/
│   └── schema.prisma           # Schema do banco de dados
├── docker-compose.yml          # Configuração Docker para PostgreSQL
├── Dockerfile                  # Dockerfile multi-stage para produção
├── package.json                # Dependências e scripts
├── tsconfig.json               # Configuração TypeScript
└── .env.example                # Modelo de variáveis de ambiente
```

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 24.x (recomendado usar nvm: `nvm use`)
- **pnpm** 10.30+ (ou npm/yarn)
- **PostgreSQL** 16+ (ou Docker para rodar via container)
- **Git** para clonar o repositório

### Contas e Chaves de API Necessárias

- **Google Cloud Console** - Para OAuth (Client ID e Client Secret)
- **Google AI Studio** - Para API Key do Gemini (opcional, para funcionalidades de IA)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd treinos-api
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

### 4. Configure o banco de dados

**Opção A: Usando Docker (Recomendado)**

```bash
docker-compose up -d
```

**Opção B: PostgreSQL local**

Certifique-se de que o PostgreSQL está rodando e atualize a `DATABASE_URL` no `.env`.

### 5. Execute as migrações do banco de dados

```bash
pnpm db:migrate
```

### 6. Gere o Prisma Client

```bash
pnpm db:generate
```

## ⚙️ Configuração de Ambiente

O arquivo `.env` deve conter as seguintes variáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão com o PostgreSQL | `postgres://user:pass@localhost:5432/treinos-api` |
| `BETTER_AUTH_SECRET` | Segredo para criptografia de sessões (mínimo 32 caracteres) | `sua-chave-secreta-aqui` |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | `seu-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth | `seu-client-secret` |
| `FRONTEND_URL` | URL do frontend da aplicação | `http://localhost:3000` |
| `API_URL` | URL base da API | `http://localhost:3333` |
| `PORT` | Porta que a API irá escutar | `3333` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API Key do Google Generative AI (Gemini) | `sua-api-key` |
| `NODE_ENV` | Ambiente de execução | `development`, `production` ou `test` |

### Gerando o BETTER_AUTH_SECRET

```bash
# No terminal
openssl rand -base64 32
```

### Configurando Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** > **Credentials**
4. Crie um **OAuth 2.0 Client ID**
5. Configure as URIs de redirecionamento autorizadas
6. Copie o **Client ID** e **Client Secret** para o `.env`

## 🏃 Como Rodar o Projeto

### Instalação de dependências

```bash
pnpm install
```

### Rodar em desenvolvimento (com hot-reload)

```bash
pnpm dev
```

A API estará disponível em `http://localhost:3333` e a documentação em `http://localhost:3333/docs/`.

### Build para produção

```bash
pnpm build
```

Este comando executa:
1. Geração do Prisma Client
2. Compilação TypeScript para JavaScript
3. Resolução de aliases de caminho

### Rodar em produção

Após o build:

```bash
node dist/index.js
```

### Usando Docker para produção

```bash
# Build da imagem
docker build -t treinos-api .

# Rodar container
docker run -p 3333:3333 --env-file .env treinos-api
```

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia o servidor em modo de desenvolvimento com hot-reload |
| `pnpm build` | Compila o TypeScript para JavaScript e gera o Prisma Client |
| `pnpm db:generate` | Gera o Prisma Client baseado no schema |
| `pnpm db:migrate` | Cria e aplica migrações do banco de dados (desenvolvimento) |
| `pnpm db:studio` | Abre o Prisma Studio para visualização do banco |
| `pnpm db:push` | Aplica o schema diretamente no banco (sem migrações) |
| `pnpm db:push:reset` | Reseta o banco e aplica o schema |

## 🌐 Rotas da API

A API segue o padrão RESTful e está organizada nos seguintes módulos:

### Autenticação (`/api/auth/*`)

Gerenciado automaticamente pelo Better Auth.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET/POST` | `/api/auth/*` | Rotas de autenticação (sign in, sign up, logout, etc.) |

### Planos de Treino (`/workout-plans`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Lista todos os planos de treino do usuário |
| `POST` | `/` | Cria um novo plano de treino |
| `GET` | `/:workoutPlanId` | Obtém detalhes de um plano específico |
| `GET` | `/:workoutPlanId/days/:workoutDayId` | Obtém um dia de treino específico |
| `POST` | `/:workoutPlanId/days/:workoutDayId/sessions` | Inicia uma sessão de treino |
| `PATCH` | `/:workoutPlanId/days/:workoutDayId/sessions/:sessionId` | Atualiza uma sessão (marca como concluída) |

### Estatísticas (`/stats`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Obtém estatísticas de treino do usuário |

**Query Parameters:**
- `from` - Data inicial (formato ISO: `YYYY-MM-DD`)
- `to` - Data final (formato ISO: `YYYY-MM-DD`)

### Dados do Usuário (`/me`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Obtém dados de treino do usuário (peso, altura, idade, % gordura) |
| `PUT` | `/` | Cria ou atualiza dados de treino do usuário |

### Home (`/home`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/:date` | Obtém dados da página inicial para uma data específica |

### Inteligência Artificial (`/ai`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/` | Chat com personal trainer virtual (streaming de resposta) |

### Documentação

A API possui documentação interativa disponível em:

- **Scalar API Reference**: `http://localhost:3333/docs/`
- **Swagger JSON**: `http://localhost:3333/swagger.json`

## 📊 Modelos de Dados

### User
- Dados pessoais e de autenticação
- Métricas corporais (peso, altura, idade, % gordura)

### WorkoutPlan
- Plano de treino com nome e status (ativo/inativo)
- Relacionado a múltiplos dias de treino

### WorkoutDay
- Dia específico da semana (MONDAY a SUNDAY)
- Pode ser dia de descanso (`isRest: true`)
- Contém exercícios e sessões

### WorkoutExercise
- Exercício individual com séries, repetições e descanso

### WorkoutSession
- Registro de sessão de treino (início e conclusão)

## 🚀 Deploy

### Deploy com Docker

O projeto inclui um `Dockerfile` multi-stage otimizado para produção:

```bash
# Build
docker build -t treinos-api .

# Run
docker run -d -p 3333:3333 \
  --env-file .env \
  --name treinos-api-container \
  treinos-api
```

### Variáveis de Ambiente em Produção

Em produção, certifique-se de:
1. Usar um `BETTER_AUTH_SECRET` forte e único
2. Configurar `NODE_ENV=production`
3. Usar URLs reais para `FRONTEND_URL` e `API_URL`
4. Configurar cookies cross-domain se necessário (domínio configurado no `advanced.crossSubDomainCookies.domain`)

### Plataformas Sugeridas

- **Railway**, **Render**, **Fly.io** - Para hospedagem com Docker
- **AWS ECS**, **Google Cloud Run** - Para ambientes enterprise
- **Neon**, **Supabase**, **Railway** - Para PostgreSQL gerenciado

## 📝 Licença

ISC

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no repositório.

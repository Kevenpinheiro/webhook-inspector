# 🎣 Webhook Inspector

Um sistema completo para capturar e inspecionar requisições de webhooks em tempo real, facilitando o desenvolvimento e debug de integrações.

## 📋 Sobre o Projeto

O Webhook Inspector é uma aplicação fullstack que permite criar endpoints temporários para receber webhooks, visualizar suas requisições e inspecionar headers, body e metadados.

## 🚀 Tecnologias Utilizadas

### Backend (API)

- **[Fastify](https://fastify.dev/)** - Framework web rápido e eficiente
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript com tipagem estática
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM moderno e type-safe
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Zod](https://zod.dev/)** - Validação de schemas com TypeScript
- **[Swagger/Scalar](https://scalar.com/)** - Documentação automática da API
- **[Biome](https://biomejs.dev/)** - Linter e formatador de código

### Frontend (Web)

- **[React 19](https://react.dev/)** - Biblioteca para construção de interfaces
- **[Vite](https://vite.dev/)** - Build tool e dev server ultrarrápido
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript com tipagem estática

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd webhook-js
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure o banco de dados

Inicie o PostgreSQL com Docker:

```bash
cd api
docker-compose up -d
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta `api`:

```bash
cd api
touch .env
```

Adicione as seguintes variáveis:

```env
NODE_ENV=
PORT=
DATABASE_URL=
```

### 5. Execute as migrações do banco de dados

```bash
# Gerar as migrações
pnpm db:generate

# Aplicar as migrações
pnpm db:migrate
```

## 🗄️ Estrutura do Projeto

```
webhook-js/
├── api/                    # Backend
│   ├── src/
│   │   ├── Routes/        # Rotas da API
│   │   ├── db/            # Configuração do banco
│   │   │   ├── schema/    # Schemas do Drizzle
│   │   │   └── migrations/# Migrações
│   │   ├── env.ts         # Validação de env vars
│   │   └── server.ts      # Servidor Fastify
│   ├── drizzle.config.ts  # Config do Drizzle
│   └── docker-compose.yaml# PostgreSQL
├── web/                   # Frontend
│   ├── src/               # Código React
│   └── public/            # Arquivos estáticos
└── package.json           # Workspace root
```

## 📖 Documentação da API

Após iniciar o servidor backend, acesse a documentação interativa em:

```
http://localhost:3333/docs
```

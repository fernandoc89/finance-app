# 📊 FinanceApp — Gestão Financeira Pessoal

Sistema completo para gestão financeira pessoal com controle de contas, cartões, transações e categorias.

---

## 🏗️ Arquitetura

Monorepo com 3 projetos:

| Projeto     | Stack                                |
| ----------- | ------------------------------------ |
| **Backend** | NestJS + PostgreSQL + TypeORM        |
| **Mobile**  | React Native + Expo + TypeScript     |
| **Web**     | React + Vite + TypeScript + Tailwind |

---

## 📁 Estrutura do Projeto

```
finance-app/
├── backend/                  # API REST
│   ├── src/
│   │   ├── auth/             # Autenticação JWT
│   │   ├── users/            # Usuários
│   │   ├── accounts/         # Contas bancárias
│   │   ├── cards/            # Cartões de crédito
│   │   ├── transactions/     # Transações
│   │   ├── categories/       # Categorias
│   │   ├── dashboard/        # Dashboard
│   │   └── database/         # Seeds e migrations
│   └── .env
├── mobile/                   # App React Native
│   └── src/
│       ├── api/              # Cliente HTTP
│       ├── contexts/         # Contextos React
│       ├── hooks/            # Hooks customizados
│       ├── screens/          # Telas
│       └── components/       # Componentes
└── web/                      # Frontend React
    └── src/
        ├── api/              # Cliente HTTP
        ├── contexts/         # Contextos React
        ├── hooks/            # Hooks customizados
        ├── pages/            # Páginas
        └── components/       # Componentes
```

---

## 🚀 Como Começar

### 1. Backend

```bash
cd backend
npm install
# Criar banco PostgreSQL: finance_app
npm run start:dev
# Swagger disponível em: http://localhost:3000/api
```

### 2. Mobile

```bash
cd mobile
npm install
npx expo start
```

### 3. Web

```bash
cd web
npm install
npm run dev
# Acessar: http://localhost:5173
```

---

## 🐳 Docker (Recomendado)

### Pré-requisitos

- Docker 24+
- Docker Compose 2+

### Início Rápido com Docker

```bash
# 1. Clonar o projeto
git clone <seu-repositorio>
cd finance-app

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env se necessário

# 3. Subir os containers
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f

# 5. Acessar serviços:
# - API:     http://localhost:3000
# - Swagger: http://localhost:3000/api
# - PgAdmin: http://localhost:5050 (opcional)
```

---

## 📊 Modelo de Dados

### Entidades Principais

| Entidade      | Campos                                                |
| ------------- | ----------------------------------------------------- |
| `User`        | email, password (hash), name                          |
| `Account`     | name, type, balance, bank, color                      |
| `Card`        | name, flag, limit, currentBalance, closingDay, dueDay |
| `Transaction` | description, amount, type, paymentMethod, date        |
| `Category`    | name, icon, color, isActive                           |

### Relacionamentos

```
User 1:N Account
User 1:N Card
User 1:N Transaction
User 1:N Category
Account 1:N Transaction
Card 1:N Transaction
Category 1:N Transaction
```

---

## 🔒 Regras de Negócio

### Transações

- ✅ Crédito: obrigatório `cardId`
- ✅ Débito/PIX/TED: obrigatório `accountId`
- ✅ Atualizar saldo automaticamente
- ✅ Reverter ao deletar
- ✅ Suporte a parcelamento

### Contas

- ✅ Saldo não pode ficar negativo
- ✅ Não deletar com transações existentes

### Cartões

- ✅ Limite não pode ser excedido
- ✅ Não deletar com fatura em aberto
- ✅ Fatura: fechamento e vencimento

### Categorias

- ✅ Soft delete se tem transações vinculadas
- ✅ Hard delete se não tem transações
- ✅ Categorias padrão criadas ao registrar usuário

---

## 📡 API Endpoints

### Autenticação

```
POST /auth/register
POST /auth/login
GET  /auth/profile        [AUTH]
```

### Usuários

```
GET    /users             [AUTH]
GET    /users/profile     [AUTH]
PATCH  /users/:id         [AUTH]
DELETE /users/:id         [AUTH]
```

### Contas

```
GET    /accounts          [AUTH]
POST   /accounts          [AUTH]
GET    /accounts/:id      [AUTH]
PATCH  /accounts/:id      [AUTH]
DELETE /accounts/:id      [AUTH]
```

### Cartões

```
GET    /cards             [AUTH]
POST   /cards             [AUTH]
GET    /cards/summary     [AUTH]
GET    /cards/:id/invoice [AUTH]
PATCH  /cards/:id         [AUTH]
DELETE /cards/:id         [AUTH]
```

### Categorias

```
GET    /categories        [AUTH]
POST   /categories        [AUTH]
POST   /categories/defaults [AUTH]
GET    /categories/stats  [AUTH]
PATCH  /categories/:id    [AUTH]
DELETE /categories/:id    [AUTH]
```

### Transações

```
GET    /transactions          [AUTH]
POST   /transactions          [AUTH]
GET    /transactions/summary  [AUTH]
PATCH  /transactions/:id      [AUTH]
DELETE /transactions/:id      [AUTH]
```

### Dashboard

```
GET    /dashboard                 [AUTH]
GET    /dashboard/balance-history [AUTH]
```

---

## 🛠️ Tecnologias

### Backend

- NestJS 10+
- PostgreSQL 14+
- TypeORM 0.3+
- JWT + Passport
- Swagger/OpenAPI
- Class Validator
- bcrypt

### Mobile

- Expo SDK 50+
- React Navigation 6+
- React Query 5+
- AsyncStorage
- React Native Chart Kit
- Vector Icons

### Web

- React 18+
- Vite 5+
- Tailwind CSS 3+
- React Router 6+
- React Query 5+
- Recharts
- Lucide React

---

## 🎨 Design System

### Cores

| Token   | Hex       | Uso                       |
| ------- | --------- | ------------------------- |
| Primary | `#6C63FF` | Indigo — ações principais |
| Success | `#4ECDC4` | Teal — confirmações       |
| Danger  | `#FF6B6B` | Red — erros/exclusões     |
| Warning | `#FFEAA7` | Yellow — alertas          |
| Info    | `#45B7D1` | Blue — informações        |
| Dark    | `#2C3E50` | Textos e fundos escuros   |
| Light   | `#F5F5F5` | Fundos claros             |

### Mobile

| Categoria         | Valores                |
| ----------------- | ---------------------- |
| Tamanhos de fonte | 12, 14, 16, 18, 24, 32 |
| Espaçamento       | 4, 8, 12, 16, 24, 32   |
| Border Radius     | 4, 8, 12, 16           |

### Web

- Classes Tailwind CSS
- Responsivo: `sm`, `md`, `lg`, `xl`
- Container: `max-w-7xl`

---

## 📝 Convenções de Código

### Nomenclatura

| Contexto         | Padrão           | Exemplo           |
| ---------------- | ---------------- | ----------------- |
| Arquivos         | kebab-case       | `user.service.ts` |
| Classes          | PascalCase       | `UserService`     |
| Funções          | camelCase        | `findAllByUser`   |
| Constantes       | UPPER_SNAKE_CASE | `JWT_SECRET`      |
| Tipos/Interfaces | PascalCase       | `CreateUserDto`   |

### TypeScript

- ✅ Strict mode sempre ativado
- ✅ Proibido usar `any`
- ✅ Interfaces para objetos
- ✅ Types para unions
- ✅ Enums para valores fixos

### Importações

- **Backend:** usar `@nestjs/common`, `@nestjs/typeorm`
- **Mobile:** path aliases (`@/components`, `@/hooks`)
- **Web:** path aliases (`@/components`, `@/hooks`)

---

## 🔐 Segurança

- JWT tokens com 7 dias de expiração
- Senhas hasheadas com bcrypt (10 rounds)
- CORS configurado para origens específicas
- Validação de ownership em todos os recursos
- Rate limiting nas rotas de auth
- Helmet para headers de segurança

---

## 📦 Scripts Úteis

### Backend

```bash
npm run start:dev          # Servidor de desenvolvimento
npm run build              # Build para produção
npm run seed               # Popular banco com dados iniciais
npm run migration:generate # Gerar migration
npm run migration:run      # Executar migrations
```

### Testes

```bash
# Backend
cd backend
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run test:cov     # Coverage

# Mobile
cd mobile && npm run test

# Web
cd web && npm run test
```

---

## 📈 Performance

- Query optimization com índices
- Paginação em todas as listagens
- Caching com React Query
- Lazy loading de módulos
- Bundle splitting no web

---

## 🐛 Debugging

| Plataforma | Ferramentas                                   |
| ---------- | --------------------------------------------- |
| Backend    | NestJS Logger, Swagger, Postman/Insomnia      |
| Mobile     | React Native Debugger, Expo DevTools, Flipper |
| Web        | React DevTools, Browser DevTools              |

---

## 📚 Documentação

- [NestJS](https://docs.nestjs.com)
- [Expo](https://docs.expo.dev)
- [React](https://react.dev)
- [TypeORM](https://typeorm.io)
- [Tailwind CSS](https://tailwindcss.com/docs)

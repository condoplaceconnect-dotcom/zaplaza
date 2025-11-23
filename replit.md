# CondoPlace - Condominium Marketplace

## 📋 Visão Geral
App de marketplace hiperlocal para condomínios. Funciona como iFood interno com produtos, serviços e agendamentos. 100% da comissão vai para vendedores (0% do app).

## 🎯 Estrutura de Usuários e Permissões

### 🟦 Cliente/Morador (resident)
- Visualizar lojas do condomínio
- Comprar produtos (carrinho + checkout)
- Visualizar serviços
- Solicitar/agendar serviços
- Ler comunicados
- Editar perfil

### 🟥 Administrador (admin)
- Registrar condomínio (com Google Maps autocomplete)
- Gerenciar moradores (CRUD)
- Gerenciar lojas e prestadores
- Criar comunicados
- Ver dashboard com métricas
- Definir regras internas

### 🟧 Vendedor (vendor)
- Criar/editar produtos (nome, preço, descrição, ingredientes)
- Upload de imagens
- Gerenciar estoque (disponibilidade)
- Acompanhar pedidos
- Responder clientes (futuro)

### 🟩 Prestador de Serviço (service_provider)
- Criar perfil (imagem, descrição, categorias)
- Listar serviços (nome, preço, duração)
- Gerenciar disponibilidade
- Receber/confirmar agendamentos
- Responder clientes (futuro)

## 🏗️ Arquitetura do Projeto

### Frontend (React + Vite)
```
client/src/
├── pages/
│   ├── CondoSelectorPage.tsx        ✅ Seleção de condomínio
│   ├── CondoRegistrationPage.tsx    ✅ Registro de condomínio (Google Maps)
│   ├── UserRegistrationPage.tsx     ✅ Registro de usuário
│   ├── HomePage.tsx                 ✅ Home com lojas e produtos
│   ├── StoreProfilePage.tsx         ✅ Perfil de loja (vendor)
│   ├── ServiceProviderProfilePage.tsx ✅ Perfil de serviço
│   ├── AdminDashboardPage.tsx       ✅ Dashboard admin
│   ├── OrdersPage.tsx               ⏳ Pedidos
│   ├── ServicesPage.tsx             ⏳ Serviços disponíveis
│   ├── AppointmentsPage.tsx         ⏳ Agendamentos
│   └── CheckoutPage.tsx             ⏳ Checkout
├── components/
│   ├── ui/                          ✅ shadcn/ui components
│   └── PhotoUpload.tsx              ✅ Upload de fotos
└── lib/
    └── queryClient.ts               ✅ TanStack Query setup
```

### Backend (Express + Node)
```
server/
├── routes.ts                        ✅ Rotas API (CRUD completo)
├── storage.ts                       ✅ In-memory storage (pronto para Postgres)
├── auth.ts                          ✅ JWT + Bcrypt + Middlewares de role
└── types.ts                         ✅ Extensões Express
```

### Database (Postgres + Drizzle)
```
shared/schema.ts                     ✅ Schema Drizzle com tabelas:
- users (com role: resident|vendor|service_provider|admin)
- condominiums (com status: pending|approved|rejected)
- stores (lojas dos vendedores)
- products (produtos das lojas)
- service_providers (prestadores)
- services (serviços oferecidos)
```

## 🔐 Fluxo de Autenticação

1. **Início**: Usuário acessa `/` (não logado)
2. **CondoSelectorPage**: Seleciona condomínio (com autocomplete)
3. **CondoRegistrationPage**: Se novo, registra condomínio
4. **UserRegistrationPage**: Registra usuário + escolhe role
5. **Login**: Após registro, faz login
6. **HomePage/AdminDashboard**: Redirecionado baseado em role

## 🛠️ Tecnologias

### Frontend
- React 18 + TypeScript
- Vite (bundler)
- shadcn/ui (componentes)
- TanStack Query v5 (data fetching)
- wouter (routing)
- react-hook-form + Zod (formulários)
- Tailwind CSS (styling)

### Backend
- Express.js
- JWT (jsonwebtoken)
- bcrypt (password hashing)
- Helmet (segurança)
- In-memory storage (convertível para Postgres)

### Database
- PostgreSQL (Neon)
- Drizzle ORM
- Drizzle Kit (migrations)

## ✅ Implementado

### Autenticação
- [x] Registro com validação Zod
- [x] Login com JWT (1h expiry)
- [x] Password hashing com bcrypt
- [x] Middlewares: authMiddleware, adminMiddleware, vendorMiddleware, serviceProviderMiddleware
- [x] Proteção de rotas por role

### Frontend
- [x] CondoSelectorPage com autocomplete (estado, cidade, rua)
- [x] CondoRegistrationPage com Google Maps
- [x] UserRegistrationPage com seleção de role
- [x] HomePage vazia (pronta para integração)
- [x] StoreProfilePage com CRUD de produtos
- [x] ServiceProviderProfilePage com CRUD de serviços
- [x] AdminDashboardPage com tabs (overview, moradores, lojas, comunicados)

### Backend
- [x] POST /api/auth/register
- [x] POST /api/auth/login
- [x] GET /api/auth/me
- [x] GET /api/condominiums (listar aprovados)
- [x] GET /api/condominiums/:id
- [x] POST /api/condominiums (criar/solicitar)
- [x] GET /api/condominiums/:condoId/stores
- [x] POST /api/stores (vendor)
- [x] GET /api/stores/:id
- [x] PATCH /api/stores/:id
- [x] GET /api/stores/:storeId/products
- [x] POST /api/products (vendor)
- [x] PATCH /api/products/:id
- [x] DELETE /api/products/:id
- [x] GET /api/users/:userId/stores
- [x] POST /api/payments/create-payment-intent
- [x] POST /api/payments/create-pix-qr
- [x] POST /api/upload

## ⏳ Próximos Passos

### Curto Prazo (MVP)
1. Integrar Postgres com Drizzle migrations
2. Implementar upload de imagens (Cloudinary/UploadThing)
3. Completar HomePage com API calls reais
4. Testes de permissões para cada role

### Médio Prazo
1. Pedidos (criar, listar, atualizar status)
2. Agendamentos (criar, confirmar, cancelar)
3. Comunicados (criar, listar, marcar como lido)
4. Chat simples cliente↔︎vendor

### Longo Prazo
1. Pagamentos reais (Stripe + Pix)
2. Notificações (push/email)
3. Analytics para admin
4. Rating/reviews

## 🚀 Como Rodar

```bash
# Dev
npm run dev

# Build
npm run build

# Migrations
npm run db:push
```

## 📝 Notas Importantes

- **Sem comissão do app**: 100% vai para vendor
- **Autocomplete**: Google Maps API (implementado no frontend)
- **Upload**: Pronto para integração com serviço externo
- **Permissões**: Middleware por role implementado
- **Database**: Pronto para migrar de in-memory para Postgres

## 👥 Autores
Desenvolvido com Replit

## 📄 Licença
MIT

# CondoPlace - Marketplace Interno de Condomínios

## 📋 Conceito Geral
CondoPlace é um **app mobile estilo "mini iFood + marketplace interno"** para condomínios residenciais.

**Arquitetura tipo WhatsApp Communities:**
- 🏢 **App = Comunidade Geral**
- 🏘️ **Cada Condomínio = um "Servidor/Grupo" dentro da comunidade**
- 🌟 **Acqua Sena (Canoas, RS) = Primeiro Servidor Oficial**

### Características Principais
- Zero comissão (100% vai para vendedores)
- Tema verde e branco
- Interface leve e minimalista
- Mobile-first (preparado para APK Android)
- Chat apenas para transações (sem chat entre moradores)

---

## 👥 Tipos de Usuários e Permissões

### 🟢 Cliente Adulto (18+)
**Permissões:**
- Comprar produtos e contratar serviços
- Usar marketplace (vender/doar/trocar)
- Criar posts em Achados & Perdidos
- Favoritar lojas e produtos
- Avaliar vendedores e serviços
- Denunciar conteúdo inadequado
- **Criar Conta Família** (adicionar dependentes menores)

### 🟡 Cliente Menor (<18 anos)
**Permissões limitadas:**
- Navegar e explorar lojas
- Favoritar produtos
- **Solicitar compras** (adulto responsável aprova)
- Reportar problemas ao responsável
- Ver Achados & Perdidos (visualização limitada)

**Restrições:**
- NÃO pode fazer login sozinho
- NÃO compra sem aprovação adulta
- NÃO acessa marketplace adulto
- NÃO usa chat

### 🟠 Lojista (Vendedor)
**Permissões:**
- Criar e gerenciar loja
- Adicionar/editar produtos
- Receber e gerenciar pedidos
- Chat com clientes (apenas sobre pedidos)
- Ver estatísticas de vendas

### 🔵 Prestador de Serviço
**Permissões:**
- Criar perfil profissional
- Listar serviços oferecidos
- Gerenciar agenda de agendamentos
- Chat com clientes (apenas sobre serviços)
- Receber avaliações

### 🟣 Entregador Interno
**Permissões:**
- Ver fila de entregas
- Atualizar status de entrega
- Chat com cliente (apenas sobre entrega)
- Receber gorjetas
- Sistema de roteamento interno

### ⚪ Funcionários do Condomínio (Bloco 0)
**Localização especial:**
- Bloco 0 / Apto 00 = Porteiros
- Bloco 0 / Apto 01 = Zelador
- Bloco 0 / Apto 02+ = Outros funcionários

**Permissões:**
- Acesso comum de cliente
- Podem fazer compras e usar serviços

### 🔴 Administrador (Admin)
**Permissões completas:**
- Aprovar/rejeitar cadastros
- Gerenciar todos os usuários
- Moderar denúncias
- Criar comunicados
- Ver métricas e dashboard
- Configurar regras do condomínio

---

## 🏗️ Arquitetura do Banco de Dados

### Tabelas Principais

#### ✅ users
Campos principais:
- `id`, `username`, `password`, `name`, `email`, `phone`
- **NOVOS:**
  - `birthDate` - Data de nascimento (verificação de idade)
  - `block` - Bloco (ex: "A", "B", "0")
  - `unit` - Apartamento (ex: "101", "00")
  - `accountType` - "adult" ou "minor"
  - `parentAccountId` - ID do responsável (para menores)
  - `relationship` - Parentesco (filho, filha, etc)
- `role` - resident, vendor, service_provider, delivery_person, staff, admin
- `status` - pending, approved, rejected, blocked_until_18

#### ✅ condominiums
- `id`, `name`, `address`, `city`, `state`, `zipCode`
- `units`, `phone`, `email`, `description`, `image`
- `status` - pending, approved, rejected

#### ✅ stores (Lojas)
- `userId`, `name`, `description`, `image`, `category`
- `status` - active, inactive

#### ✅ products (Produtos das Lojas)
- `storeId`, `name`, `description`, `image`, `price`
- `ingredients`, `available`

#### ✅ service_providers (Prestadores)
- `userId`, `name`, `description`, `serviceType`
- `rating`

#### ✅ services (Serviços Oferecidos)
- `providerId`, `name`, `description`, `price`, `duration`
- `available`

#### ✅ delivery_persons (Entregadores)
- `userId`, `name`, `phone`, `block`, `unit`
- `status` - online, offline
- `rating`, `totalDeliveries`

#### ✅ orders (Pedidos)
- `condoId`, `storeId`, `residentId`, `deliveryPersonId`
- `status` - pending, confirmed, preparing, ready, on_way, delivered, cancelled
- `totalPrice`, `items` (JSON), `tip`

#### 🆕 marketplace_items (Marketplace entre moradores)
- `condoId`, `userId`, `title`, `description`, `images`
- `category`, `type` (sale/donation/exchange), `price`
- `block`, `unit`
- `status` - available, sold, reserved, removed

#### 🆕 lost_and_found (Achados & Perdidos)
- `condoId`, `userId`, `type` (lost/found)
- `title`, `description`, `images`, `category`
- `locationFound`, `block`, `contactInfo`
- `status` - active, resolved, expired

#### 🆕 reports (Denúncias)
- `condoId`, `reporterId`, `targetType`, `targetId`
- `reason`, `description`, `evidence` (JSON)
- `status` - pending, under_review, resolved, dismissed
- `adminNotes`, `resolvedBy`

---

## 🎯 Funcionalidades Principais

### 1. 🛒 Lojas
- Categorias dinâmicas (Comida, Sobremesas, Roupas, Pets, Estética, etc)
- Catálogo de produtos
- Sistema de pedidos
- Chat cliente ↔ loja
- Avaliações e ratings
- Promoções e cupons (futuro)

### 2. 🛠️ Serviços
- Categorias (Barbeiro, Manicure, Mecânico, Eletricista, etc)
- Sistema de agendamentos
- Chat cliente ↔ prestador
- Avaliações e ratings

### 3. 📦 Entregas Internas
- Entregadores do próprio condomínio
- Rastreamento de status:
  - "Pedido em preparo"
  - "Saiu para entrega"
  - "Chegou no seu bloco"
- Sistema de gorjetas
- Mapa interno (opcional)

### 4. 🏪 Marketplace entre Moradores
- Vendas livres
- Doações
- Trocas
- Categorias dinâmicas
- Fotos + descrição + preço
- Localização interna (bloco/apto)

### 5. 🔍 Achados & Perdidos
- Posts com foto + descrição
- Local onde foi encontrado
- Contato seguro
- Status: ativo, resolvido

### 6. 💬 Chat (Apenas Transações)
- Cliente ↔ Loja
- Cliente ↔ Entregador
- Cliente ↔ Prestador de Serviço
- **ZERO chat entre moradores** (evita conflitos)

### 7. 🚨 Sistema de Denúncias
**Adultos podem denunciar:**
- Produtos impróprios
- Má conduta
- Fraude/golpe
- Assédio
- Conteúdo ofensivo
- Problemas com entrega
- Preço abusivo
- Violações de regras

**Menores:**
- Apenas "Reportar ao Responsável"
- Adulto decide se transforma em denúncia oficial

**Painel Admin:**
- Ver todas as denúncias
- Investigar com evidências
- Tomar ações (advertir, banir, etc)

---

## 🔐 Sistema de Conta Família

### Como Funciona
1. **Adulto cria conta normalmente** (18+)
2. **Adulto vai em Perfil → Conta Família**
3. **Adiciona dependentes menores:**
   - Nome
   - Data de nascimento (validada como <18)
   - Avatar
   - Grau de parentesco (filho, filha, dependente)

### Controle Parental
**Adulto vê TUDO:**
- Histórico de navegação
- Solicitações de compra
- Notificações
- Tentativas de acesso

**Adulto aprova compras:**
- Menor "Solicita" compra
- Adulto recebe notificação
- Adulto "Aprova" ou "Recusa"

**Menores NÃO têm:**
- Login próprio
- Senha própria
- Acesso independente

---

## 🎨 Design e Interface

### Tema Visual
- **Cores:** Verde (primário) + Branco (fundo) + Preto (texto)
- **Estilo:** Minimalista, limpo, rápido

### Menu Principal
**2 botões grandes no centro:**
- 🏪 Lojas
- 🛠️ Serviços

**Três pontinhos no topo (extras):**
- 🏪 Marketplace
- 🔍 Achados & Perdidos
- 🔔 Notificações
- 👤 Perfil

**Avatar no canto superior direito**

---

## 🛠️ Stack Tecnológico

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

### Database
- PostgreSQL (Neon) ✅ ATIVO
- Drizzle ORM
- Drizzle Kit (migrations)

### Integrações Futuras
- Chat em tempo real (Pusher/Supabase/Firebase)
- Push notifications
- Upload de imagens (Cloudinary/UploadThing)

---

## ✅ Status de Implementação

### ✅ CONCLUÍDO
- [x] Schema do banco de dados completo
- [x] Tabelas: users, condominiums, stores, products, services
- [x] Tabelas: delivery_persons, orders, appointments
- [x] **NOVOS:** marketplace_items, lost_and_found, reports
- [x] Campos de idade, bloco, apartamento, tipo de conta
- [x] Sistema multi-condomínios
- [x] Autenticação JWT
- [x] Registro e login básico

### ⏳ EM DESENVOLVIMENTO
- [ ] Verificação de idade (bloquear <18)
- [ ] Sistema de Conta Família
- [ ] Página Marketplace
- [ ] Página Achados & Perdidos
- [ ] Sistema de Entregas Internas
- [ ] Sistema de Denúncias
- [ ] Chat em tempo real
- [ ] Atualização de design (verde e branco)

### 📋 PENDENTE
- [ ] Notificações push
- [ ] Upload de imagens
- [ ] Sistema de pagamentos
- [ ] Avaliações e ratings
- [ ] Analytics e métricas

---

## 🏢 Condomínios Cadastrados

### ✅ Acqua Sena (Primeiro Servidor)
- **Endereço:** Rua Cairú, Bairro Fátima, Canoas - RS, 92320-260
- **Status:** Aprovado ✅
- **Tipo:** Residencial
- **Unidades:** ~150
- **Papel:** Primeiro condomínio oficial - servidor principal

---

## 🔑 Contas de Teste

### Administrador
- Username: `admin`
- Password: `admin123`
- Acesso completo ao dashboard admin

### Vendedor
- Username: `vendedor1`
- Password: `senha123`
- Loja: "Loja do João"

### Cliente
- Username: `maria_silva`
- Password: `senha123`
- Moradora padrão

### Prestador de Serviço
- Username: `carlos_servicos`
- Password: `senha123`
- Serviços: Eletricista

---

## 📝 Próximos Passos Críticos

1. **Implementar verificação de idade no registro**
2. **Criar sistema de Conta Família**
3. **Desenvolver página Marketplace**
4. **Desenvolver página Achados & Perdidos**
5. **Implementar sistema de denúncias**
6. **Configurar chat em tempo real**
7. **Atualizar design para verde e branco**

---

## 👥 Autores
Desenvolvido com Replit

## 📄 Licença
MIT

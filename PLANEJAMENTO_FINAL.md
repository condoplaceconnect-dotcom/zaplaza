Zaplaza — Design do App (UI + Páginas + Admin)
Documento totalmente organizado em seções separadas, com cada grupo de telas bem dividido, limpo e fácil de navegar. Agora o layout está estruturado como um manual profissional de design, tudo em blocos independentes.

1. Identidade Geral
1.1 Paleta Zaplaza
Verde primário (marca): #00B368

Preto grafite: #0F1724

Laranja destaque: #FF7A45

Cinzas neutros: #FFFFFF, #F7FAFC, #E6EEF2, #6B7280

1.2 Tipografia
Títulos: Poppins Bold (padrão para destaque)

Texto: Inter Regular (padrão para corpo de texto e legibilidade)

1.3 Componentes fixos
Header (logo + título + menu + compartilhar)

Bottom Nav (Home • Pedidos • Chat • Perfil)

FAB universal (Ação contextual, ex: “Anunciar Produto”, “Oferecer Serviço”)

Card padrão (produto/serviço/anúncio)

Botão universal de compartilhar

Modal rápido (confirmar ações)

2. Estrutura por Papéis (cada grupo em seção separada)
2A — Cliente / Morador
**Home do Cliente
Seções da Home (4 áreas principais)
Loja (padrão iFood) – lista de restaurantes, mercados e lojas internas.

Serviços – prestadores do condomínio, manutenção, diaristas, etc.

Marketplace – estilo Facebook Marketplace: vendas, trocas, doações.

**Pesquisa (Lupa)

Barra de busca global

Sugestões inteligentes conforme digita

Filtros personalizados (preço, distância, categoria, data, relevância)

Alternar visualização: Lojas ou Itens (igual iFood)

Ordenação: "Mais próximo", "Mais barato", "Mais recente", "Mais vendido"

Histórico rápido de buscas

FAB Criar Anúncio

Produto Detalhe
Carousel

Preço

Descrição

Botões: Comprar / Negociar / Compartilhar

Reviews

Criar Anúncio
Tipo (Venda / Doação)

Fotos

Título

Descrição

Preço

Categoria

Torre / Unidade

Perfil do Cliente
Dados pessoais

Métodos de pagamento

Endereço interno

Meus anúncios

2B — Vendedor / Loja Interna
Dashboard do Vendedor
Vendas em andamento

Pedidos pendentes

Gráficos simples

Produtos da Loja
Criar produto

Editar

Estoque

Pedidos Recebidos
Aceitar

Preparar

Pronto pra entrega

Atribuir entregador

2C — Prestador de Serviço
Agenda
Solicitações

Calendário

Aceitar / recusar serviço

Meus Serviços
Criar pacotes

Preço por hora

Descrição

2D — Entregador
Tela 1 — Entregas Disponíveis
Lista de pedidos por proximidade

Botão Aceitar

Botão Compartilhar

Tela 2 — Entrega em Andamento
Status (Retirar → Em rota → Entregue)

Botão gigante "Marcar como entregue"

Chamar cliente

Rota no mapa

Tela 3 — Perfil do Entregador
Histórico

Ganhos

Disponibilidade (online/offline)

2E — Admin (Tudo Separado e Organizado)
Dashboard Geral
Usuários ativos

Pedidos totais

Reclamações

Gráficos simples

Gerenciar Condomínios
Aprovar novos

Editar dados

Remover

Gerenciar Usuários
Buscar

Editar papéis

Banir / Suspender

Gerenciar Lojas e Prestadores
Aprovar

Editar

Remover

Relatórios Financeiros
Faturamento

Repasses

Lucro do app

Logs & Segurança
Auditoria

Ações suspeitas

Gestão de uploads

3. Fluxos Separados (cada um em bloco próprio)
Fluxo — Criar Anúncio
Abrir FAB

Escolher tipo

Enviar fotos

Preencher dados

Publicar

Compartilhar link

Fluxo — Pedido de Entrega
Cliente compra

Loja prepara

Entregador aceita

Entregador faz rota

Marca entregue

Fluxo — Aprovação de Condomínio (Admin)
Condo pede acesso

Admin verifica dados

Aprova ou recusa

Condo liberado

4. Endpoints da API (pré-esboço)
Tudo separado para ficar fácil de ler e implementar.

**Autenticação**
`POST /auth/login`
`POST /auth/register`

**Marketplace (Itens)**
`GET /marketplace/items?category={}&sortBy={price_asc|recent}&page={}`
`GET /marketplace/items/:id`
`POST /marketplace/items`
`PATCH /marketplace/items/:id`
`DELETE /marketplace/items/:id`

**Serviços**
`GET /services?category={}&userId={}`
`GET /services/:id`
`POST /services`
`PATCH /services/:id`
`DELETE /services/:id`

**Pedidos**
`POST /orders`
`GET /orders/:id`

**Entrega**
`POST /deliveries/accept`

**Admin**
`GET /admin/metrics`

5. Área de Assets (organizada)
Ícone 01: /mnt/data/A_flat_design_digital_vector_graphic_showcases_the.png

Ícone 02: /mnt/data/A_flat_digital_vector_illustration_displays_the_lo.png

Se quiser, eu gero versões:

192×192

512×512

Splash screen

Modo claro/escuro

6. Próximos Passos
Criar mockups separados (entregador, vendedor, cliente, admin).

Organizar JSON final dos endpoints.

Preparar arquivos para PWA + Play Store.

Dossiê Zaplaza – Seção 1

Módulo "Empresta Aí" – Sistema de Empréstimos Comunitários

1. Propósito

Criar um ecossistema seguro, organizado e social para empréstimos dentro de condomínios ou comunidades, fortalecendo laços e estimulando colaboração.

2. Fluxo do Pedido

- Usuário cria um pedido descrevendo o item desejado (nome, foto opcional, urgência).
- O pedido aparece como um pop‑up comunitário, visível para todos os moradores.
- Moradores interessados enviam uma “oferta de empréstimo” que fica vinculada ao pedido original.
- O solicitante vê uma lista de ofertas (ex: “João do ap 101 ofereceu uma furadeira Bosch”).
- Ele escolhe a melhor oferta e clica em “Aceitar e Combinar”.
- APENAS NESSE MOMENTO, um chat privado é aberto entre os dois para combinar a entrega.
- As outras ofertas são automaticamente recusadas com uma mensagem de agradecimento.

3. Confirmação do Empréstimo

Quando o solicitante aceita o item de um dos doadores:

Ele clica em “Confirmar empréstimo com esta pessoa”.

O dono do item confirma: “Emprestar agora”.

Todos os outros chats são encerrados automaticamente.

Os demais recebem mensagem automática: “O item já foi emprestado. Obrigado pela ajuda!”.

4. Registro Obrigatório do Empréstimo

Para garantir segurança jurídica:

Ambos devem registrar:

Foto do item no momento do empréstimo.

Condição atual.

Data de devolução combinada.

O app gera um termo de responsabilidade digital, aceito por ambos.

5. Termo Digital

O termo inclui:

Identificação das partes.

Descrição e foto do item.

Data limite para devolução.

Cláusula de responsabilidade baseada no Código Civil (artigos sobre comodato e danos ao patrimônio).

Aviso: não devolução pode gerar medidas legais.

Botão: “Li e aceito”.

O termo fica disponível:

Para ambos os usuários.

Para o painel do condomínio.

Para o painel do app, em caso de disputas.

6. Sistema de Devolução

Quando o item retorna:

O dono confirma a devolução.

Tira foto do item devolvido.

Avalia o estado (ok / danificado).

O sistema encerra o empréstimo.

Se houver dano:

Abre-se um **ticket de disputa** mediado por um administrador do condomínio (Sub-Admin).

O sistema anexa automaticamente o termo digital e as fotos para análise do mediador.

O canal de resolução é um chat privado que inclui o solicitante, o dono do item e o mediador.

7. Pontuação e Benefícios

A cada empréstimo:

Quem empresta ganha pontos sociais.

Quem devolve corretamente também pontua.

Bônus especial:

Foto juntos sorrindo no ato do empréstimo (fica 24h nos stories)

Recompensas possíveis:

Destaque no feed comunitário.

Acesso a emojis exclusivos.

Mini-personalizações do avatar.

Futuramente: descontos e benefícios reais.

8. Stories Integrados

Dois tipos de stories:

Stories de Utilidade (prioritários: lojas, serviços, avisos).

Stories Sociais (incluindo empréstimos, ações legais, boa convivência).

O story de empréstimo mostra:

Foto do item.

Foto dos usuários sorrindo.

Botão Compartilhar.

Botão Agradecer.

9. Ferramentas de Criador (para stories)

Texto fácil.

Fotos.

Stickers simples.

Templates de “emprestado”, “devolvido”, “obrigado”.

10. Painel Administrativo do Condomínio

Condomínio pode:

Ver histórico de empréstimos.

Acompanhar disputas.

Gerar relatórios.

Aplicar advertências internas.

11. Segurança

Verificação por endereço/unidade.

Registro de identidade válido.

Termo legal automático.

Notificações de inadimplência de devolução.

Sistema anti-fraude com fotos antes/depois.

12. Interação com Outras Partes do App

O "Empresta Aí" conversa com:

Marketplace (para indicar produtos semelhantes à venda).

Serviços (para indicar consertos caso o item seja devolvido danificado).

Pontuação geral do usuário.

13. Observações

Esta é apenas a primeira parte do dossiê.
Próxima seção será definida juntos, expandindo o ecossistema Zaplaza.

Dossiê — Parte 2 (Zaplaza)

Novas Funções e Expansões do Sistema

1. Camada “Empresta Aí” (Sistema de Empréstimos)

-   Pedido aberto para todo o condomínio.
-   Pop‑up estilo “pedido de clã” de jogos.
-   Moradores interessados enviam uma “oferta de empréstimo” que fica vinculada ao pedido original.
-   O solicitante vê uma lista de ofertas (ex: “João do ap 101 ofereceu uma furadeira Bosch”).
-   Ele escolhe a melhor oferta e clica em “Aceitar e Combinar”.
-   APENAS NESSE MOMENTO, um chat privado é aberto entre os dois para combinar a entrega.
-   As outras ofertas são automaticamente recusadas com uma mensagem de agradecimento.
-   Registro obrigatório com fotos do item no envio e na devolução.
-   Painel de itens emprestados/pendentes para ambos.
-   Avisos legais + termo aceito no cadastro:
    -   Possibilidade de responsabilização civil em caso de não
        devolução.
    -   Permissão para o app registrar prova (fotos e logs).
-   Possibilidade futura: acionar sistema de “disputa”.

------------------------------------------------------------------------

2. Stories Internos do App

-   Stories divididos:
    -   Lojas / Serviços (sempre prioritários).
    -   Comunidade / Momentos / Empréstimos concluídos.
-   Stories duram 24h.
-   Todos os stories têm botão Compartilhar (WhatsApp, Instagram,
    TikTok, Facebook, Kwai, etc).
-   Foto conjunta no ato do empréstimo gera pontos + aparece nos
    stories.
-   Lojistas podem criar:
    -   Promoções
    -   Combos
    -   Cupons
    -   Materiais visuais rápidos com ferramentas internas

------------------------------------------------------------------------

3. Sistema de Pontuação

-   Moradores ganham pontos por:
    -   Emprestar itens
    -   Cumprir devoluções
    -   Tirar foto com o vizinho (consentimento mútuo)
    -   Participar de ações comunitárias
-   Lojas ganham pontos por:
    -   Engajamento
    -   Frequência de posts
    -   Avaliações positivas
-   Pontos podem render:
    -   Destaque temporário no feed
    -   Aparição acima em stories
    -   Recursos cosméticos (emojis, molduras, avatares)
-   Futuro: descontos reais, cashback, benefícios pagos.

------------------------------------------------------------------------

4. Eventos Exclusivos para Comerciantes

-   Uma aba separada, visível apenas para lojistas e serviços.
-   Não aparece para clientes para evitar poluição visual.
-   Eventos possíveis:
    -   Feiras internas
    -   Vaquinhas para criar vitrines coletivas
    -   Ações sazonais (Dia das Mães, Black Friday interna)
-   Só vira anúncio público se o evento realmente for confirmado.
-   Stories fixos para divulgação quando aprovado.

------------------------------------------------------------------------

5. Ferramentas Visuais para Lojistas

-   Criador de stories nativo:
    -   Templates
    -   Texto
    -   Efeitos simples
    -   Stickers promocionais
-   Criador de anúncio rápido:
    -   Foto
    -   Preço
    -   Bônus
    -   Cupom
-   Botão de compartilhar em todos os conteúdos criados.

------------------------------------------------------------------------

6. Admin — Nova Estrutura Avançada

Administração global

-   Todos os condomínios
-   Auditoria
-   Logs
-   Segurança
-   Termos legais
-   Penalidades
-   Moderação de disputas

Administração por condomínio (Sub-Admin)

-   Cada condomínio tem seu próprio admin local
-   Funções:
    -   Aprovar moradores
    -   Resolver disputas internas
    -   Moderar marketplace local
    -   Banir moradores problemáticos
    -   Ajustar regras internas (ex: horários de entregadores)

Admin global vê tudo; sub-admin só vê seu “servidor”.

------------------------------------------------------------------------

7. Estrutura Multi-Condomínio

-   Um único app → vários “mundos” separados.
-   Cada conta pertence a um condomínio por padrão.
-   Lojistas e prestadores podem ativar modo multi-condomínio (manual).
-   Anúncios, marketplace, stories, pedidos:
    -   Não aparecem entre condomínios diferentes por padrão.
-   O usuário só vê:
    -   Seus vizinhos
    -   Suas lojas
    -   Seus prestadores
    -   Seus eventos

------------------------------------------------------------------------

8. Permissões do App

O Zaplaza pedirá:

-   Câmera (foto de produtos, stories, empréstimos)
-   Arquivos / Galeria
    -   O app oferecerá duas opções:
        1.  Acessar todas as fotos (fácil para idosos)
        2.  Acessar apenas fotos selecionadas
-   Localização
    -   Para entregadores
    -   Para rota de serviços
    -   Para validar o condomínio
-   Notificações
    -   Pedidos
    -   Entregas
    -   Promoções
    -   Stories importantes
-   Microfone (opcional, para áudios no chat futuramente)

O app não vê fotos não selecionadas quando o usuário usa o modo
“selecionar apenas”.

------------------------------------------------------------------------

9. Termos de Uso — Pontos Importantes

-   Podemos colocar que o período “Plus” é por tempo indeterminado.
-   Legalmente válido, desde que:
    -   Está escrito nos termos
    -   O usuário concorda na criação da conta
    -   O app possa encerrar o plano a qualquer momento
-   Termos abrangem:
    -   Empréstimos e disputas
    -   Responsabilidade por devolução
    -   Armazenamento de fotos como prova
    -   Penalidades por mau uso
    -   Multi-condomínio
    -   Acesso às permissões

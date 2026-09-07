# Registro de Decisões Técnicas e Arquiteturais (DECISOES.md)

Este documento registra as principais decisões tomadas durante o planejamento e desenvolvimento do **Sistema Profissional de Solicitação de Jogos**.

---

## 1. Escolha da Stack Tecnológica

### Frontend
- **React + TypeScript + Vite**: Escolhidos pela alta performance de build (HMR ultrarrápido com esbuild/Rollup), tipagem estática que previne erros em tempo de execução e ampla maturidade de ecossistema.
- **Sass (SCSS) + Bootstrap 5**: O Bootstrap forneceu a base sólida de grid e acessibilidade, enquanto o Sass modular (`_variables.scss`, `_mixins.scss`, `_responsive.scss`, `components/`) permitiu um tema moderno em modo escuro/gamer, com efeitos de glassmorphism e identidade visual customizada.
- **React Router v6**: Roteamento declarativo com suporte a histórico de navegação e componentes guardiões (`ProtectedRoute`).
- **Axios**: Gerenciamento de requisições HTTP com interceptors para tokens e envio automático de credenciais (`withCredentials: true`).

### Backend
- **Node.js + Express.js + TypeScript**: Combinação robusta, permitindo tipagem de ponta a ponta, arquitetura limpa (Controllers, Models, Middlewares, Routes) e alta produtividade.
- **MySQL 2 (`mysql2/promise`)**: Driver de alta performance com pool de conexões assíncrono e suporte nativo a Prepared Statements contra SQL Injection.
- **Autenticação JWT com Cookie HttpOnly**: O token JWT é armazenado preferencialmente em cookie `HttpOnly`, `SameSite=Lax` e `Secure` (em produção), com header `Authorization: Bearer` como fallback. Isso previne vulnerabilidades de roubo de sessão via scripts maliciosos (XSS).
- **bcrypt**: Hashing de senhas com salt rounds = 10, garantindo que senhas de administradores nunca sejam salvas em texto puro.
- **helmet + express-rate-limit**: Camada extra de segurança com cabeçalhos HTTP defensivos e contenção de ataques de força bruta no login.

---

## 2. Decisões de Arquitetura e Organização do Código

1. **Separação Clara de Responsabilidades (SoC)**:
   - `Controllers`: Gerenciam requisição/resposta HTTP e status codes.
   - `Models`: Encapsulam as consultas SQL parametrizadas e lógica de persistência (`RequestModel`, `AdminModel`).
   - `Middlewares`: Isolam autenticação, limitação de taxa e tratamento global de erros.
   - `Validators`: Validações reutilizáveis no backend para garantir consistência de dados (inclusive plataformas permitidas: `PS4`, `PS5`, `Xbox Series`, `Nintendo`).

2. **Persistência Real no MySQL e Inicialização Segura**:
   - O botão "Solicitar jogo" executa estritamente uma query `INSERT INTO requests (...)` após validação no backend, gravando a solicitação diretamente no MySQL.
   - O banco de dados e suas tabelas são criados via `database/schema.sql` ou verificados de forma segura durante a inicialização do servidor backend (`initializeDatabase`).
   - Script standalone `createAdmin.ts` (`npm run create-admin`) para criação e reativação do administrador com senha criptografada a partir do `.env`.

3. **Gerenciamento Completo de Administradores & Proteções de Segurança**:
   - Status `is_active` na tabela `admins`: administradores desativados são impedidos de realizar login no sistema.
   - **Trava de Segurança de Desativação**: O backend valida se existem outros administradores ativos antes de permitir a desativação de qualquer conta, impedindo que o sistema fique sem acesso administrativo (`countActive`).
   - Módulo de **Minha Conta**: Permite atualização de dados cadastrais e alteração da própria senha exigindo validação prévia com bcrypt da senha atual.

4. **Paginação Real no Banco de Dados**:
   - As consultas de paginação utilizam `LIMIT ? OFFSET ?` diretamente no MySQL, calculando o total de registros via query agregada (`COUNT(*)`). Evita-se sobrecarregar a memória do servidor e da aplicação cliente.

5. **Abordagem Mobile-First e Responsividade Adaptativa**:
   - Em desktop: exibição em **tabela completa com rolagem horizontal controlada**.
   - Em dispositivos móveis: transformação dinâmica em **cards individuais** (`.mobile-request-card`), proporcionando uma experiência de toque natural em smartphones.
   - Grid de KPIs adaptativo (1 coluna em `<576px`, 2 colunas em `576px-991px`, 5 colunas em `>=992px`).
   - Touch targets de no mínimo 44px e acessibilidade visual com ícones e textos para os status e plataformas.

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

## Sobre o Uso da IA

### O que você delegou para a IA e o que fez à mão, e por quê

Deleguei para a IA a estruturação inicial do projeto, a criação dos arquivos base de frontend e backend, a implementação das rotas, controllers, models e validações. O principal motivo foi economizar tempo na configuração inicial e garantir que a arquitetura seguisse as melhores práticas.

A primeira coisa importante é que eu tinha um objetivo bem claro de usar TypeScript, React, Vite, Node.js com Express e MySQL, pois são tecnologias que eu conheço e já utilizei anteriormente em outros projetos meus. Eu também queria que o projeto tivesse uma arquitetura limpa, com separação de responsabilidades entre controllers, models, validações e middlewares. Além disso, eu queria que o projeto fosse escalável e que tivesse uma boa experiência de usuário, com design moderno e responsivo.

### Uma vez em que a IA te deu algo ruim ou errado: o que era, como você percebeu, e o que fez no lugar

A IA me deu algumas sugestões ruins durante meus código e prompts iniciais, pois estava tentando escolher um melhor caminho para salvar as informações mas eu acabei não gostando muito do que ela sugeriu. Por exemplo, ela sugeriu que eu usasse localStorage para armazenar o token JWT, mas eu preferi usar cookie HttpOnly. O motivo é que cookie HttpOnly é mais seguro, tinha visto um video recentemente sobre segurança na web, e então quis testar e aplicar o conhecimento que adquiri neste projeto.

### Uma decisão que você tomou contra a sugestão da IA, e o motivo

Uma das sugestões que eu fui contra foi sobre qual banco de dados usar, no caso eu preferi utilizar MySQL ao invés de MongoDB, também decidi usar o XAMPP para gerenciar o banco de dados, pois é uma ferramenta que eu já conheço e utilizo em outros projetos, ela inicialmente havia me sugerido usar o MySQL Community Server. Também teve a mudança no formato da tabela que os administradores vão ver a informação dos jogos solicitados, inicialmente o layout estava muito poluído de informações, tive que fazer alterações para deixar ele mais limpo e melhor compreensível.

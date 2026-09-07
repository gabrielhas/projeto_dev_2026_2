<p align="center">
  <img src="logo.png" alt="Mupi Systems Logo" width="180"/>
</p>

# Sistema Profissional de Solicitação de Jogos (Game Requests)

[![Node.js](https://img.shields.io/badge/Node.js-20.x+-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap&logoColor=white)](https://getbootstrap.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com)

Projeto fullstack completo desenvolvido para gerenciar **solicitações de jogos** com **persistência real no MySQL**, composto por uma **área pública moderna e responsiva (Mobile-First)** com seleção de plataformas de jogos e um **painel administrativo protegido** por autenticação JWT (cookies HttpOnly) com **módulo completo de gerenciamento de administradores (cadastro, ativação, desativação com travas de segurança e alteração de senhas)**.

---

## 🎮 Funcionalidades do Sistema

### 🌐 Área Pública (`/`)
- **Página Inicial Gamer**: Interface responsiva e moderna com paleta escura, efeitos de glassmorphism e tipografia fluida.
- **Formulário de Solicitação**:
  - Campos:
    - **Nome completo** (2 a 100 caracteres)
    - **E-mail** (formato válido, até 150 caracteres)
    - **Nome do Jogo** (1 a 200 caracteres)
    - **Plataforma** (`<select>` obrigatório: `PS4`, `PS5`, `Xbox Series`, `Nintendo`)
  - O clique em **"Solicitar jogo"** valida os dados e executa `INSERT` no MySQL, retornando confirmação visual e limpando o formulário.
  - Bloqueio contra múltiplos envios simultâneos.

### 🛡️ Área Administrativa (`/admin/*`)
- **Login Seguro (`/admin/login`)**:
  - Autenticação via JWT emitido em cookie `HttpOnly` com fallback Bearer.
  - Verificação do status `is_active` da conta (administradores inativos têm o acesso negado com mensagem neutra).
  - Criptografia de senhas com `bcrypt` (10 rounds de salt).
  - Rate limiting ativo para prevenção de força bruta.
  - Registro de `last_login` a cada autenticação bem-sucedida.

- **Dashboard de Solicitações (`/admin/dashboard` & `/admin/requests`)**:
  - **KPI Cards Resumo**: Total, Pendentes, Aprovadas, Concluídas (`completed`) e Rejeitadas.
  - **Pesquisa em Tempo Real**: Busca textual por nome, e-mail ou nome do jogo.
  - **Filtro por Plataforma**: Todas, PS4, PS5, Xbox Series, Nintendo.
  - **Filtro por Status**: Todas, Pendentes, Aprovadas, Concluídas, Rejeitadas.
  - **Alteração Rápida de Status**: `pending`, `approved`, `completed`, `rejected`.
  - **Exclusão com Confirmação**: Modal de confirmação antes de remover qualquer registro no MySQL.
  - **Paginação Real no MySQL**: Utilizando `LIMIT` e `OFFSET` no banco de dados.
  - **Design Adaptativo**: Tabela com scroll horizontal no Desktop e Cards Individuais no Mobile.

- **Gerenciamento de Administradores (`/admin/admins`)**:
  - Listagem de moderadores com ID, Nome, E-mail, Status (`● Ativo` / `○ Inativo`), Último Login e Data de Criação.
  - Cadastro de novos administradores com status ativo por padrão.
  - Edição de nome e e-mail.
  - Ativação e desativação com **trava de segurança** (impede desativação do último administrador ativo do sistema).
  - Redefinição de senha por outros administradores.

- **Minha Conta (`/admin/account`)**:
  - Visualização de dados e data do último login.
  - Atualização de dados cadastrais.
  - Alteração da própria senha com validação da senha atual.

- **Detalhes da Solicitação (`/admin/requests/:id`)**:
  - Auditoria completa dos metadados e alteração de status individual.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** & **TypeScript**
- **Vite** (Build tool de alta performance)
- **Sass/SCSS** (Modular: variáveis, mixins, responsive e componentes)
- **Bootstrap 5** & **Bootstrap Icons**
- **React Router v6**
- **Axios** (com interceptors e `withCredentials`)

### Backend
- **Node.js** & **Express.js** (TypeScript)
- **mysql2** (Pool de conexões assíncronas com Prepared Statements)
- **JSON Web Token (JWT)**
- **bcrypt** (Hash de senhas)
- **helmet** & **express-rate-limit**
- **cookie-parser** & **cors**
- **dotenv**

### Banco de Dados
- **MySQL 8.0+**

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18.x ou superior)
- **NPM** ou **Yarn**
- **MySQL** (serviço MySQL em execução localmente ou via container)

---

### 1. Clonar o Repositório e Instalar Dependências

No diretório raiz do projeto:

```bash
# Instala as dependências do backend e do frontend
npm run install:all
```

---

### 2. Configurar e Popular o Banco de Dados MySQL

O projeto é compatível com qualquer servidor MySQL (XAMPP, Laragon, WampServer, Docker ou MySQL nativo).

#### Forma Automática (Recomendada)
Com o serviço do MySQL iniciado (ex: Start no MySQL do XAMPP):

```bash
npm run db:seed
```
> Esse comando conecta via Node.js usando as configurações do seu `backend/.env`, cria o banco `game_requests` e as tabelas caso não existam e insere os dados iniciais de teste e administrador.

#### Forma Manual (Opcional)
- **Via phpMyAdmin (XAMPP):** Acesse `http://localhost/phpmyadmin` no navegador, clique na aba **Importar**, selecione `database/schema.sql` e depois `database/seed.sql`.
- **Via Terminal CLI:**
  ```bash
  mysql -u root -p < database/schema.sql
  mysql -u root -p < database/seed.sql
  ```

> **Nota:** O servidor backend também possui verificação automática: ao inicializar (`npm run dev:backend`), ele verifica a conexão e garante as tabelas e o administrador inicial.

---

### 3. Configurar as Variáveis de Ambiente

Crie o arquivo `.env` dentro da pasta `backend/` baseado no `.env.example`:

```env
# backend/.env
PORT=3001
NODE_ENV=development

# Conexão MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=game_requests

# Autenticação JWT
JWT_SECRET=super_secret_jwt_key_games_mupi_2026_change_in_production
JWT_EXPIRES_IN=1d

# URL do Frontend (CORS)
FRONTEND_URL=http://localhost:5173

# Credenciais do Administrador Inicial (Seed)
ADMIN_NAME=Administrador Master
ADMIN_EMAIL=admin@gamerequests.com
ADMIN_PASSWORD=Admin@123
```

Para executar o script de criação do administrador inicial via terminal:
```bash
npm run create-admin --prefix backend
```

---

### 4. Inicializar o Backend

Abra um terminal na pasta `backend/`:

```bash
cd backend
npm run dev
```

O servidor iniciará em `http://localhost:3001`.

---

### 5. Inicializar o Frontend

Abra outro terminal na pasta `frontend/`:

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## 🔐 Credenciais de Acesso Administrativo

Ao iniciar o sistema pela primeira vez ou executar o seed, as seguintes credenciais padrão estarão ativas:

| Campo | Valor Padrão |
|---|---|
| **URL de Login** | `http://localhost:5173/admin/login` |
| **E-mail** | `admin@gamerequests.com` |
| **Senha** | `Admin@123` |

---

## 📡 Endpoints da API REST

### Autenticação & Conta (`/api/auth`)
| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Autentica o administrador ativo e emite cookie JWT |
| `POST` | `/api/auth/logout` | Público | Encerra a sessão e limpa cookie |
| `GET` | `/api/auth/me` | Autenticado | Retorna os dados do administrador logado |
| `PATCH` | `/api/auth/password` | Autenticado | Altera a própria senha |
| `PATCH` | `/api/auth/profile` | Autenticado | Atualiza nome e e-mail do próprio perfil |

### Gerenciamento de Administradores (`/api/admins`)
| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/admins` | Autenticado | Lista todos os administradores cadastrados |
| `GET` | `/api/admins/:id` | Autenticado | Busca dados de um administrador |
| `POST` | `/api/admins` | Autenticado | Cadastra um novo administrador (`is_active = true`) |
| `PATCH` | `/api/admins/:id` | Autenticado | Atualiza dados cadastrais |
| `PATCH` | `/api/admins/:id/status` | Autenticado | Ativa/desativa admin (com proteção contra desativação do último ativo) |
| `PATCH` | `/api/admins/:id/password` | Autenticado | Redefine a senha de um administrador |

### Solicitações de Jogos (`/api/requests`)
| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/requests` | Público | Salva uma nova solicitação no MySQL com plataforma |
| `GET` | `/api/requests` | Autenticado | Lista solicitações (`?page=1&limit=10&search=...&status=...&platform=...`) |
| `GET` | `/api/requests/stats/summary` | Autenticado | Retorna contadores agregados para os KPI cards |
| `GET` | `/api/requests/:id` | Autenticado | Busca detalhes de uma solicitação por ID |
| `PATCH` | `/api/requests/:id/status` | Autenticado | Atualiza status (`pending`, `approved`, `completed`, `rejected`) |
| `DELETE` | `/api/requests/:id` | Autenticado | Exclui uma solicitação do MySQL |

---

## 🧪 Testes Automatizados

Para rodar a suíte de testes unitários e de integração do backend:

```bash
cd backend
npm test
```

---

## 📱 Responsividade e Acessibilidade

O layout foi desenvolvido seguindo a metodologia **Mobile-First**, testado nos principais breakpoints:
- **Smartphones (320px - 480px)**: Formulário verticalizado, menu hambúrguer, lista adaptativa em cards, botões touch com altura `>= 44px`.
- **Tablets (576px - 768px)**: Grid de KPIs adaptativo, navegação otimizada.
- **Desktops e Monitores Ultrawide (992px - 1920px)**: Tabela administrativa com dados completos e filtros em linha.
- **Acessibilidade**: Labels explícitos associados via `htmlFor`, contraste WCAG AA, badges com ícones e modais com captura de foco.

---

## 📄 Licença

Este projeto é desenvolvido para o teste técnico de Desenvolvedor Full Stack na **Mupi Systems**.

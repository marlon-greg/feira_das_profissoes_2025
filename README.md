
# Sistema de Inscrições - Feira das Profissões SESI 2025

Este projeto é uma aplicação web completa para gerenciar as inscrições dos alunos nas palestras da Feira das Profissões SESI 2025. A plataforma inclui uma interface pública para os alunos se inscreverem e um painel administrativo robusto para gerenciar palestras, inscrições e usuários.

## ✨ Funcionalidades

### Visão Pública (Alunos)

  - **Homepage:** Apresenta as instituições e palestrantes parceiros do evento.
  - **Formulário de Inscrição:** Permite que os alunos se cadastrem fornecendo dados pessoais (Nome, RM, E-mail, etc.).
  - **Seleção de Palestras:** Interface organizada por dia e horário para a escolha das palestras.
  - **Controle de Vagas:**
      - Exibe a contagem de vagas restantes para cada palestra.
      - Atualiza a contagem de vagas a cada 30 segundos.
      - Bloqueia automaticamente a seleção de palestras que já atingiram a capacidade máxima.
  - **Validação:** Garante que cada aluno (identificado por e-mail ou RM) só possa se inscrever uma única vez.
  - **Controle de Abertura:** O formulário fica inacessível se as inscrições forem encerradas pelo administrador.

### Painel Administrativo

O painel é dividido em três seções principais e possui dois níveis de acesso: **Administrador** e **Visitante**.

#### 🤵 **Perfil: Administrador (Controle Total)**

  - **Gerenciamento de Palestras (`/admin#admin`):**
      - Visualiza palestras agrupadas por dia e horário, e ordenadas por sala.
      - **Cria** novas palestras.
      - **Edita** informações de palestras existentes (título, palestrante, sala, capacidade).
      - **Exclui** palestras.
      - Abre uma janela (modal) para ver a lista de inscritos de cada palestra.
  - **Gerenciamento de Inscritos (`/admin#registrations`):**
      - Visualiza uma lista completa de todos os alunos inscritos, agrupados por palestra.
      - **Exclui** a inscrição de um aluno em uma palestra específica.
          - Se for a última palestra do aluno, o cadastro completo dele é removido do sistema.
      - Limpa "cadastros órfãos" (alunos sem nenhuma palestra).
  - **Gerenciamento de Usuários (`/admin#users`):**
      - Visualiza todos os usuários do sistema (Admins e Visitantes).
      - **Cria** novos usuários, definindo seu perfil.
      - **Exclui** usuários existentes (exceto o próprio).
  - **Controles Gerais:**
      - **Abre e Fecha** as inscrições para todos os alunos com um único botão.
      - **Exporta** um arquivo `.csv` com a lista de presença completa, organizada por palestra.

#### 🧑‍💻 **Perfil: Visitante (Controle Limitado)**

  - **Gerenciamento de Palestras (`/admin#admin`):**
      - Visualiza as palestras com a mesma organização do admin.
      - **Edita** informações de palestras existentes.
      - Visualiza a lista de inscritos de cada palestra.
      - *Não pode criar ou excluir palestras.*
  - **Gerenciamento de Inscritos (`/admin#registrations`):**
      - Visualiza a lista completa de todos os alunos inscritos.
      - *Não pode excluir inscrições.*
  - **Controles Gerais:**
      - **Exporta** o arquivo `.csv` com a lista de presença.
      - *Não pode gerenciar usuários nem abrir/fechar as inscrições gerais.*

## 💻 Tecnologias Utilizadas

| Frontend                               | Backend                                     |
| -------------------------------------- | ------------------------------------------- |
| **React 19** com TypeScript            | **Node.js** |
| **Vite** como ambiente de desenvolvimento | **Express.js** para a API REST            |
| Navegação baseada em Hash (`#`)          | **SQLite3** como banco de dados             |
| CSS puro para estilização              | **bcrypt.js** para hashing de senhas        |
|                                        | **jsonwebtoken** (JWT) para autenticação    |
|                                        | **concurrently** para rodar os dois servers |

## 🚀 Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar o projeto na sua máquina.

### 1\. Pré-requisitos

  - [Node.js](https://nodejs.org/) (versão 18 ou superior)
  - NPM (geralmente instalado com o Node.js)

### 2\. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
```

### 3\. Instalar as Dependências

Execute o comando abaixo para instalar todas as dependências do `package.json`:

```bash
npm install
```

### 4\. Configurar o Banco de Dados

O arquivo `banco.sql` contém a estrutura inicial do banco. Para criá-lo:

  - Execute o comando abaixo no terminal. Ele criará o arquivo `feira.db` e o preencherá com as tabelas e usuários iniciais.

<!-- end list -->

```bash
npx sqlite3 feira.db < banco.sql
```

  - **Logins Padrão:**
      - **Admin:** `usuario: admin`, `senha: admin`
      - **Visitante:** `usuario: visitante`, `senha: visitante`

### 5\. Iniciar o Projeto

Use o script `dev` para iniciar o servidor do backend e o servidor de desenvolvimento do frontend simultaneamente.

```bash
npm run dev
```

O terminal mostrará que:

  - O backend está rodando na porta `3001`.
  - O frontend (Vite) está rodando na porta `5173`.

### 6\. Acessar a Aplicação

  - **Página Pública:** [http://localhost:5173/](https://www.google.com/search?q=http://localhost:5173/)
  - **Painel Admin:** [http://localhost:5173/\#admin](https://www.google.com/search?q=http://localhost:5173/%23admin)

## 🌐 Deploy na Vercel (Aviso Importante)

O projeto está pré-configurado para deploy na Vercel através do arquivo `vercel.json`.

⚠️ **Atenção:** O **SQLite não é compatível** com o ambiente de produção da Vercel, pois seu sistema de arquivos é "efêmero" (temporário) e o arquivo `feira.db` será apagado a cada novo deploy ou reinicialização.

Para um deploy de produção, é **altamente recomendado** migrar o banco de dados para uma solução serverless, como:

  - **Vercel Postgres** (possui um plano gratuito generoso)
  - **Neon**
  - **Supabase**

## 🛠️ Scripts NPM

  - `npm run dev`: Inicia os servidores de backend e frontend em modo de desenvolvimento.
  - `npm run build`: Compila o frontend React/TypeScript para produção na pasta `dist`.
  - `npm run start:backend`: Inicia apenas o servidor de backend.

# ✦ stoqd 

O **stoqd** é um sistema *full-stack* de Gestão de Estoque e Ponto de Venda desenvolvido para automatizar e otimizar as operações de um negócio de varejo. O projeto centraliza o controle de produtos, fluxo de caixa e gestão complexa de vendas a prazo.

## 🛠️ Arquitetura e Tecnologias

A aplicação foi projetada utilizando uma arquitetura **Cliente-Servidor (API REST + SPA)**, com uma separação rigorosa de responsabilidades e forte ênfase na modelagem de dados, segurança e regras de negócio no servidor.

### Backend (Core do Sistema)
- **Node.js** com **Express** para roteamento ágil e estruturação da API REST.
- **TypeScript** garantindo tipagem estática ponta a ponta e previsibilidade no fluxo de dados.
- **Prisma ORM** para a modelagem relacional de dados, validação e versionamento seguro do banco via migrations.
- **PostgreSQL** (Hospedado via **Supabase**) escolhido pela conformidade ACID, garantindo a integridade das transações de vendas e do registro de parcelas.
- **Segurança:** Implementação de JWT (JSON Web Token) para rotas privadas, proteção de headers com **Helmet** e mitigação de ataques de força bruta com **Express Rate Limit**.

### Frontend
- **React 19** com **Vite** para um ambiente de desenvolvimento rápido e otimizado da SPA.
- **TypeScript** para escalabilidade e prevenção de erros de tempo de execução.
- **Axios** (com *interceptors*) para comunicação segura e envio automático de tokens de autorização.
- **Recharts** para a renderização do Dashboard analítico.
- **CSS Customizado** (Variáveis globais, CSS Reset e Design System próprio, garantindo alta performance sem dependência de bibliotecas pesadas de UI).

## ✨ Funcionalidades Principais

- **Frente de Caixa (PDV):** Interface reativa para registro de vendas, com suporte a múltiplos itens e baixa automática e transacional no estoque.
- **Gestão de Vendas a Prazo:** Controle rigoroso de parcelas atreladas a clientes, com status dinâmico de pendência e cruzamento de datas de vencimento.
- **Dashboard de Analytics:** Visão financeira em tempo real do faturamento mensal, capital imobilizado em estoque e projeção de lucro.
- **Gestão de Inventário:** CRUD completo de produtos com categorização por marcas e alertas automáticos de baixo estoque.
- **Histórico de Clientes:** Extrato detalhado cruzando o histórico de compras, pagamentos realizados e a soma de débitos em aberto.

## ⚙️ Como rodar o projeto localmente

### Pré-requisitos
- Node.js (v18 ou superior)
- Um banco de dados PostgreSQL (ou conta no Supabase)

### 1. Clonar o repositório
```bash
git clone [https://github.com/seu-usuario/stoqd.git](https://github.com/seu-usuario/stoqd.git)
cd stoqd
```

### 2. Configurar o Backend
```bash
cd backend
npm install
```
Crie um arquivo `.env` na pasta `backend` seguindo o modelo:
```env
DATABASE_URL = "url_de_conexao_do_postgres"
JWT_SECRET = "chave_jwt"
ADMIN_EMAIL = "admin@email.com"
ADMIN_PASSWORD = "senha"
```
Rode as migrações para construir as tabelas no banco de dados e inicie o servidor:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Configurar o Frontend
Em outro terminal, acesse a pasta do frontend e instale as dependências:
```bash
cd ../frontend
npm install
```
Inicie o ambiente de desenvolvimento:
```bash
npm run dev
```

---

## 👨‍💻 Autor

[**Arthur Correia**](https://www.linkedin.com/in/arthur-correia-b7b883222/)

Graduando em Ciência da Computação pela UFCG e desenvolvedor com foco em sistemas backend.
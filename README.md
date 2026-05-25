<div align="center">

# UniVerso

Plataforma educativa para promoção da igualdade e combate ao preconceito

**Centro Universitário Católica do Tocantins — UniCatólica · Palmas, TO**

</div>

---

## Visão Geral

O **UniVerso** é uma plataforma web desenvolvida pela UniCatólica com foco em educação, diversidade e combate ao preconceito. Oferece conteúdo temático estruturado, quiz interativo, recursos pedagógicos para docentes e um mural de compromissos com moderação manual.

O projeto utiliza HTML, CSS e JavaScript puros no frontend, Vercel Functions como camada serverless e Supabase (PostgreSQL + RLS) como banco de dados.

**Produção:** [universo-respeito.vercel.app](https://universo-respeito.vercel.app)

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e desenvolvimento local](#instalação-e-desenvolvimento-local)
- [Configuração do Supabase](#configuração-do-supabase)
- [Deploy na Vercel](#deploy-na-vercel)
- [Moderação do mural](#moderação-do-mural)
- [Testes](#testes)
- [Segurança e privacidade](#segurança-e-privacidade)
- [Contribuindo](#contribuindo)

---

## Funcionalidades

| Módulo | Arquivo | Descrição |
|---|---|---|
| Página inicial | `index.html` | Biblioteca de materiais, experiências por público, mural e formulário de contato |
| Trilhas temáticas | `temas/` | Cinco trilhas educativas sobre igualdade e diversidade |
| Quiz | `quiz.html` | Quiz interativo com progresso salvo no navegador e selo imprimível |
| Área do professor | `professores.html` | Materiais didáticos e plano de aula imprimível |
| Pesquisa | `pesquisa.html` | Busca de conteúdos e materiais |
| Apoio | `apoio.html` | Orientação segura para situações de bullying e preconceito |
| API | `api/` | Endpoints serverless para contato e compromissos integrados ao Supabase |

---

## Arquitetura

```
UniVerso/
├── api/                        # Vercel Functions (serverless)
├── assets/                     # Arquivos estáticos (imagens, fontes, ícones)
├── lib/                        # Utilitários e helpers JavaScript compartilhados
├── materiais/                  # Materiais educativos para download
├── temas/                      # Trilhas temáticas (5 módulos)
├── tests/
│   └── smoke.mjs               # Suite de testes (Playwright Core)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── index.html
├── apoio.html
├── pesquisa.html
├── professores.html
├── quiz.html
├── vercel.json                 # Configuração de rotas e rewrite rules
├── package.json
└── .env.example
```

**Stack:**

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5 · CSS3 · JavaScript (ESM) |
| Serverless | Vercel Functions |
| Banco de dados | Supabase (PostgreSQL) com Row Level Security |
| Testes | Playwright Core |
| Infraestrutura | Vercel (CDN + Functions) |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) `>= 24.x`
- [Vercel CLI](https://vercel.com/docs/cli) — `npm i -g vercel`
- Conta na [Vercel](https://vercel.com) e no [Supabase](https://supabase.com) (necessárias apenas para deploy completo)

---

## Instalação e desenvolvimento local

```bash
# Clone o repositório
git clone https://github.com/geraldojoao/UniVerso.git
cd UniVerso

# Instale as dependências
npm install

# Copie e preencha as variáveis de ambiente (opcional)
cp .env.example .env

# Inicie o servidor local via Vercel CLI
npm run dev
```

> **Sem variáveis do Supabase**, o frontend e o quiz funcionam normalmente. Os formulários exibirão uma mensagem informando que o banco ainda não foi configurado.

---

## Configuração do Supabase

### 1. Executar a migração

No painel do Supabase, acesse **SQL Editor** e execute:

```
supabase/migrations/001_initial_schema.sql
```

### 2. Definir variáveis de ambiente

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<sua-chave-anon-publica>
```

Configure essas variáveis localmente no `.env` e na Vercel em **Settings → Environment Variables**.

### Política de acesso (RLS)

| Operação | Permissão pública |
|---|---|
| Enviar mensagem de contato | ✅ Permitido |
| Enviar compromisso | ✅ Permitido (entra como `pending`) |
| Ler compromissos aprovados | ✅ Permitido |
| Ler mensagens de contato | ❌ Bloqueado |

---

## Deploy na Vercel

```bash
# Primeiro deploy — vincula o projeto à sua conta
npx vercel

# Adicionar variáveis de ambiente
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_PUBLISHABLE_KEY

# Promover para produção
npx vercel --prod
```

Alternativamente, conecte o repositório diretamente pelo painel da Vercel em **Add New Project → Import Git Repository**.

---

## Moderação do mural

Compromissos enviados ficam com `status = 'pending'` até serem revisados manualmente. Para aprovar um item, execute no **SQL Editor** do Supabase:

```sql
UPDATE public.commitments
SET    status      = 'approved',
       approved_at = now()
WHERE  id = '<uuid-do-compromisso>';
```

Mensagens de contato ficam em `public.contact_messages` e nunca são expostas publicamente via RLS.

---

## Testes

```bash
npm run check
```

O script `tests/smoke.mjs` verifica com Playwright Core:

- Carregamento das páginas principais em viewport desktop e mobile
- Funcionamento do menu de navegação
- Filtros, slider e componentes interativos
- Submissão dos formulários
- Fluxo completo do quiz
- Validação básica dos endpoints da API

---

## Segurança e privacidade

A plataforma **não deve ser utilizada para receber relatos sensíveis em ambiente público**. Para situações reais de violência ou discriminação, a página [`apoio.html`](apoio.html) orienta sobre canais institucionais adequados e contatos de confiança.

A integração com o Supabase utiliza exclusivamente a **chave anon (publicável)**, protegida por Row Level Security. Nenhuma chave de serviço (`service_role`) é exposta no cliente.

---

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch descritiva: `git checkout -b feat/nome-da-feature`
3. Realize os commits seguindo [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/): `git commit -m "feat: descrição da mudança"`
4. Abra um Pull Request detalhando as alterações realizadas

---

<div align="center">

Desenvolvido pela equipe UniVerso · **UniCatólica — Palmas, TO**

</div>

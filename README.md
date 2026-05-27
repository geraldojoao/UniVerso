<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6c3fc4,50:3a7bd5,100:00bfa6&height=160&section=header&text=UniVerso&fontSize=52&fontColor=ffffff&fontAlignY=55" width="100%" />

<h3>Plataforma educativa para promoção da igualdade e combate ao preconceito</h3>

<p><strong>Centro Universitário Católica do Tocantins — UniCatólica · Palmas, TO</strong></p>

<p>
  <a href="https://universo-respeito.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Ver_ao_vivo-universo--respeito.vercel.app-6c3fc4?style=for-the-badge" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel" />
  <a href="https://github.com/geraldojoao/UniVerso/actions/workflows/ci.yml"><img src="https://github.com/geraldojoao/UniVerso/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI status" /></a>
  <img src="https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Tests-Playwright_E2E-45ba4b?style=flat-square&logo=playwright" />
  <img src="https://img.shields.io/badge/Security-CSP_%2B_RLS-e11d48?style=flat-square" />
  <img src="https://img.shields.io/badge/A11y-WCAG_/_ARIA-6c3fc4?style=flat-square" />
  <img src="https://img.shields.io/badge/Frontend-Zero_Dependencies-00bfa6?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-3a7bd5?style=flat-square" />
</p>

</div>

---

## ✨ Visão Geral

O **UniVerso** é uma plataforma web educacional fullstack desenvolvida para apoiar conversas sobre preconceito, bullying, diversidade e cidadania em ambiente escolar. Atende alunos, professores e famílias com trilhas temáticas, quiz interativo, plano de aula imprimível e mural de compromissos com moderação.

**Stack:** HTML5 · CSS3 · JavaScript (ESM) · Vercel Functions (Node.js) · Supabase (PostgreSQL + RLS)

> 🔗 **Demo ao vivo:** [universo-respeito.vercel.app](https://universo-respeito.vercel.app)

---

## 🏗️ Arquitetura

```
universo-respeito/
├── api/                          # Vercel Functions (serverless)
│   ├── commitments.js            # GET aprovados + POST moderado
│   └── contact.js                # POST com validação dupla (client + server)
│
├── assets/
│   ├── css/styles.css            # Design system completo (700+ linhas, zero framework)
│   └── js/
│       ├── main.js               # Nav, reveal animations, slider, filtros, formulários
│       ├── quiz.js               # Engine do quiz com estado e localStorage
│       └── commitments.js        # Fetch + render do mural moderado
│
├── temas/                        # 5 trilhas educativas (HTML semântico)
│   ├── igualdade.html
│   ├── bullying.html
│   ├── diversidade.html
│   ├── cidadania.html
│   └── como-agir.html
│
├── materiais/
│   └── plano-aula-respeito.html  # Plano imprimível com @media print
│
├── lib/
│   └── supabase-server.js        # Client singleton + helpers tipados
│
├── supabase/migrations/
│   └── 001_initial_schema.sql    # Schema + RLS policies completas
│
├── tests/
│   └── smoke.mjs                 # E2E Playwright: desktop + mobile + API
│
├── index.html                    # SPA-like: hero, trilhas, biblioteca, mural, contato
├── quiz.html                     # Quiz interativo com selo imprimível
├── professores.html              # Área pedagógica
├── pesquisa.html                 # Painel de indicadores
├── apoio.html                    # Orientação anti-bullying
└── vercel.json                   # Rotas, headers de segurança, cache
```

**Fluxo de dados**

```
Browser ──── GET /api/commitments ──▶ Vercel Function
                                           │
                                     Supabase RLS
                                     (apenas approved)
                                           │
                                      PostgreSQL
                                           │
                                    ◀─── JSON ────
```

---

## 🔒 Segurança & Privacidade

Este projeto implementa múltiplas camadas de defesa:

| Camada | Implementação | Onde |
|---|---|---|
| **Content-Security-Policy** | `default-src 'self'` — bloqueia XSS e injeção de recursos externos | `vercel.json` |
| **Row Level Security (RLS)** | Políticas explícitas por operação; `service_role` nunca exposta no cliente | `001_initial_schema.sql` |
| **Honeypot anti-spam** | Campo invisível `website` — bots que preenchem recebem `201 OK` sem gravação | `commitments.js`, `contact.js` |
| **Validação dupla** | Client-side (UX) + Server-side (segurança) com regex e limites de tamanho | `main.js` + `api/*.js` |
| **Payload limit** | `content-length > 10 000` rejeitado antes do parse | `supabase-server.js` |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | `vercel.json` |
| **Permissions-Policy** | Camera, mic e geolocation bloqueados | `vercel.json` |
| **Cache imutável** | Assets com hash servidos com `max-age=31536000, immutable` | `vercel.json` |

---

## ♿ Acessibilidade (WCAG / ARIA)

| Recurso | Implementação |
|---|---|
| Skip link | `#conteudo` — primeiro elemento focável da página |
| Focus trap | Menu mobile: Tab/Shift+Tab circula apenas entre os itens do menu |
| `aria-hidden` | Menu mobile oculto para leitores de tela quando fechado |
| `aria-expanded` | Botão do menu anuncia estado ao screen reader |
| `aria-live="polite"` | Status de filtros e slider anunciado dinamicamente |
| `aria-current` | Seção ativa na nav atualizada por `IntersectionObserver` |
| `aria-invalid` | Campos com erro marcados semanticamente |
| `prefers-reduced-motion` | Todas as animações desativadas via media query |
| Contraste | Paleta projetada para contraste mínimo WCAG AA |

---

## ⚡ Performance & Qualidade

- **Zero frameworks de frontend** — sem React, Vue ou jQuery; bundle de JS < 15 KB total
- **CSS puro com design system** — custom properties, `clamp()` para tipografia fluida, sem `!important`
- **Fontes com `preconnect`** — tempo de conexão ao Google Fonts reduzido
- **Assets imutáveis** — 1 ano de cache para CSS/JS versionados
- **IntersectionObserver** para animações e navegação ativa — sem scroll listeners síncronos
- **`passive: true`** no listener de scroll do header
- **`replaceChildren()`** em vez de `innerHTML` — sem serialização de HTML

---

## 🧪 Testes

```bash
npm run check   # Executa smoke.mjs via Playwright Core
```

O suite de testes cobre:

| Cenário | Tipo |
|---|---|
| Carregamento de 11 páginas (desktop + mobile) | E2E |
| Menu mobile: abertura, fechamento por Escape, focus trap | Interação |
| Filtros de biblioteca por categoria | Interação |
| Slider de experiências por público (navegação por dots e setas) | Interação |
| Submissão do formulário de compromisso | Integração |
| Submissão do formulário de contato | Integração |
| Fluxo completo do quiz (6 questões → resultado → localStorage) | E2E |
| `POST /api/contact` com dados inválidos → `400` | API |
| `POST /api/commitments` sem banco → `503` | API |
| `GET /api/commitments` sem banco → `503` | API |
| Zero erros de JavaScript no console | Smoke |

---

## 🗄️ Banco de Dados

**Política de acesso (Row Level Security)**

| Operação | Role pública (`anon`) |
|---|---|
| `INSERT` em `contact_messages` | ✅ Permitido |
| `SELECT` em `contact_messages` | ❌ Bloqueado |
| `INSERT` em `commitments` (status `pending`) | ✅ Permitido |
| `SELECT` em `commitments` (status `approved`) | ✅ Permitido |
| Qualquer escrita com `approved_at` preenchido | ❌ Bloqueado via `WITH CHECK` |

**Schema simplificado**

```sql
contact_messages (id, name, email, school, message, source, created_at, handled_at)
commitments      (id, name, message, status ∈ {pending,approved,rejected}, created_at, approved_at)
```

---

## 🚀 Rodando localmente

```bash
# 1. Clone e instale
git clone https://github.com/geraldojoao/UniVerso.git
cd UniVerso && npm install

# 2. Configure variáveis (opcional — o frontend funciona sem o banco)
cp .env.example .env
# Preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY

# 3. Inicie o servidor
npm run dev   # http://localhost:3000
```

> **Sem Supabase:** quiz, trilhas e navegação funcionam normalmente. Formulários exibem mensagem de configuração pendente.

---

## ☁️ Deploy

```bash
npx vercel                            # Primeiro deploy + vinculação
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_PUBLISHABLE_KEY
npx vercel --prod                     # Promoção para produção
```

Ou conecte diretamente o repositório pelo painel Vercel em **New Project → Import Git Repository**.

---

## 📋 Moderação do mural

```sql
-- Aprovar um compromisso pendente no SQL Editor do Supabase:
UPDATE public.commitments
SET    status      = 'approved',
       approved_at = now()
WHERE  id = '<uuid>';
```

---

## 📦 Dependências

| Pacote | Versão | Uso |
|---|---|---|
| `@supabase/supabase-js` | `^2.106.2` | Client do banco (server-side only) |
| `playwright-core` | `^1.52.0` | Testes E2E (dev) |

**Dependências de frontend: zero.**

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/sua-feature`
3. Commite seguindo [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/): `feat:`, `fix:`, `docs:`, `refactor:`
4. Abra um Pull Request descrevendo o problema resolvido

Consulte [CONTRIBUTING.md](.github/CONTRIBUTING.md) para o guia completo.

---

## 🗺️ Roadmap

- [x] CI/CD com GitHub Actions (lint + smoke test automático em PRs)
- [ ] Migração para TypeScript
- [ ] Dashboard de moderação autenticado (Supabase Auth)
- [ ] Painel de métricas de engajamento (quizzes concluídos, mural ativo)
- [ ] i18n básico (pt-BR / en)

---

<div align="center">

Desenvolvido por **Geraldo João** · UniCatólica — Palmas, TO

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00bfa6,100:6c3fc4&height=80&section=footer" width="100%" />

</div>

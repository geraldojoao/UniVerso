# Guia de Contribuição - UniVerso

Obrigado pelo interesse em contribuir! Este guia explica como o projeto funciona, como configurar o ambiente e os padrões que mantemos.

---

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como reportar problemas](#como-reportar-problemas)
- [Fluxo de trabalho](#fluxo-de-trabalho)
- [Padrões de código](#padrões-de-código)
- [Commits (Conventional Commits)](#commits-conventional-commits)
- [Rodando os testes](#rodando-os-testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Acessibilidade - não negociável](#acessibilidade---não-negociável)

---

## Código de Conduta

Este projeto é um espaço educacional voltado à inclusão. Espera-se que toda contribuição respeite a diversidade de pessoas e contextos. Comentários ofensivos, discriminatórios ou que violem a proposta do projeto serão removidos.

---

## Como reportar problemas

1. Verifique se o problema já foi reportado em [Issues](https://github.com/geraldojoao/UniVerso/issues).
2. Se não, abra uma nova issue com:
   - **Título claro** descrevendo o problema ou melhoria
   - **Passos para reproduzir** (para bugs)
   - **Comportamento esperado vs. atual**
   - **Screenshot** se for visual
   - **Ambiente:** navegador, sistema operacional, viewport

> Para vulnerabilidades de segurança, **não abra issue pública**. Envie diretamente por um canal privado ao mantenedor.

---

## Fluxo de trabalho

```bash
# 1. Fork e clone
git clone https://github.com/SEU-USUARIO/UniVerso.git
cd UniVerso

# 2. Configure o upstream
git remote add upstream https://github.com/geraldojoao/UniVerso.git

# 3. Crie uma branch descritiva a partir de main
git checkout main
git checkout -b feat/nome-da-feature
# ou
git checkout -b fix/descricao-do-bug

# 4. Desenvolva, testando localmente
npm install
cp .env.example .env.local   # configure se for mexer em formulários/banco
npm run dev

# 5. Rode os testes antes de commitar
npm run lint:html
npm run check

# 6. Commit seguindo Conventional Commits
git commit -m "feat: adicionar nova trilha temática"

# 7. Push e Pull Request
git push origin feat/nome-da-feature
```

No Pull Request:
- Descreva **o que** foi feito e **por que**
- Referencie a issue relacionada: `Closes #42`
- Verifique se os testes de CI passaram

---

## Padrões de código

### HTML

- Semântica correta: use `<article>`, `<section>`, `<nav>`, `<aside>`, `<main>`
- Todo elemento interativo deve ter label acessível (`aria-label`, `<label for>`, texto visível)
- Atributos `lang` em páginas fora do padrão pt-BR
- Breadcrumbs em todas as páginas internas

### CSS

- Use as custom properties definidas em `:root` sempre que possível
- Breakpoints existentes: `1060px`, `800px`, `640px`; use-os antes de criar novos
- Animações dentro de `@media (prefers-reduced-motion: reduce)` devem ser desativadas
- Evite `!important`

### JavaScript

- ES Modules (`type="module"`), sem CommonJS no frontend
- Funções nomeadas em vez de arrows anônimas grandes
- Valide entradas tanto no cliente (`main.js`) quanto no servidor (`api/`)
- Prefira `replaceChildren()` a `innerHTML` ao renderizar conteúdo fornecido pelo usuário

### API (Vercel Functions)

- Sempre valide payload com os helpers de `lib/supabase-server.js`
- Honeypot: retorne `201 OK` sem gravar quando `website` estiver preenchido
- Nunca exponha `service_role` key no cliente
- Mantenha Row Level Security (RLS) nas tabelas públicas

---

## Commits (Conventional Commits)

| Prefixo | Quando usar |
| --- | --- |
| `feat:` | Nova funcionalidade visível ao usuário |
| `fix:` | Correção de bug |
| `docs:` | Apenas documentação |
| `style:` | Formatação, sem mudança de lógica |
| `refactor:` | Reescrita sem mudança de comportamento |
| `test:` | Adição ou correção de testes |
| `chore:` | Configuração, build, dependências |
| `a11y:` | Melhorias de acessibilidade |
| `perf:` | Melhorias de performance |
| `security:` | Correções de segurança |

**Exemplos:**

```text
feat: adicionar trilha temática sobre saúde mental
fix: corrigir focus trap ao fechar menu com Escape
a11y: adicionar aria-describedby nos campos de formulário
docs: atualizar seção de deploy na Vercel
```

Escopo opcional: `feat(quiz): aumentar banco de perguntas para 10`

---

## Rodando os testes

```bash
npm run lint:html
npm run check
```

O script `tests/smoke.mjs` utiliza Google Chrome em desenvolvimento no Windows. No CI, o Chromium é instalado e utilizado automaticamente pelo Playwright.

Para adicionar novos testes, siga o padrão existente em `smoke.mjs`:
- Um `assert` por comportamento verificado
- Viewport desktop (1280 x 960) e mobile (375 x 900)
- Mantenha o listener de `pageerror` para detectar falhas de JavaScript

---

## Estrutura do projeto

```text
api/           Vercel Functions - um arquivo por endpoint
assets/css/    Design system em CSS puro
assets/js/     Scripts por responsabilidade (main, quiz, commitments)
lib/           Helpers reutilizáveis (apenas server-side)
supabase/      Migrations SQL - nunca altere sem criar nova migration
temas/         Páginas de trilhas temáticas
materiais/     Recursos imprimíveis
tests/         Suite E2E com Playwright
```

---

## Acessibilidade - não negociável

Qualquer contribuição que quebre os seguintes requisitos deverá ser corrigida antes do merge:

- [ ] Skip link presente e funcional
- [ ] Todo elemento interativo alcançável via Tab
- [ ] Menus e overlays com gerenciamento de foco
- [ ] `aria-hidden` em elementos decorativos quando necessário
- [ ] `aria-live` em regiões com conteúdo dinâmico
- [ ] Contraste mínimo adequado para texto normal
- [ ] Animações desativadas com `prefers-reduced-motion`

---

Dúvidas? Abra uma [discussion](https://github.com/geraldojoao/UniVerso/discussions) ou entre em contato via [Issues](https://github.com/geraldojoao/UniVerso/issues).

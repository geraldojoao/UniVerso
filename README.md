# UniVerso

Plataforma educativa do Centro Universitário Católica do Tocantins - UniCatólica, em Palmas - TO, para promoção da igualdade e combate ao preconceito.

## Site publicado

Produção: <https://universo-respeito.vercel.app>

O frontend e as funções estão publicados. Para habilitar os formulários, execute a migração SQL do Supabase descrita abaixo.

## O que foi construído

- Página inicial responsiva com biblioteca de materiais, experiências por público, mural moderado e contato.
- Cinco trilhas temáticas em `temas/`.
- Quiz interativo com selo imprimível e progresso salvo no navegador.
- Área para professores e plano de aula imprimível.
- Página de orientação segura para situações de bullying e preconceito.
- Painel de indicadores e metas de mobilização do projeto.
- API da Vercel integrada ao Supabase para contato e compromissos.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra a URL informada pelo Vercel CLI. Sem variáveis do Supabase, o site e o quiz funcionam, mas os formulários informam que o banco ainda não foi configurado.

## Configurar o Supabase

1. No projeto Supabase, abra o SQL Editor e execute [001_initial_schema.sql](supabase/migrations/001_initial_schema.sql).
2. No painel da Vercel, adicione estas variáveis de ambiente:

```text
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sua-chave-publicável-do-projeto
```

A integração usa a chave publicável, protegida por Row Level Security (RLS): visitantes podem enviar contato, enviar compromissos pendentes e ler somente compromissos aprovados. Mensagens de contato nunca são liberadas para leitura pública.

O exemplo de instalação do Supabase para Next.js (`@supabase/ssr`, `page.tsx` e middleware de sessão) não é necessário neste projeto, que usa HTML/JavaScript e Vercel Functions sem autenticação.

### Moderação do mural

Compromissos enviados entram com status `pending`. Para aprovar um item após revisão, execute no SQL Editor:

```sql
update public.commitments
set status = 'approved', approved_at = now()
where id = 'UUID_DA_MENSAGEM';
```

Mensagens do formulário de contato ficam em `public.contact_messages` e não são exibidas publicamente.

## Deploy na Vercel

Pelo terminal, dentro desta pasta:

```bash
npx vercel
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_PUBLISHABLE_KEY
npx vercel --prod
```

Também é possível conectar este diretório a um repositório GitHub pelo painel da Vercel e configurar as mesmas variáveis em **Settings > Environment Variables**.

## Testes

```bash
npm run check
```

O teste verifica páginas principais em tela desktop e mobile, menu, filtros, slider, formulários, quiz e validação mínima das funções API.

## Privacidade

O projeto não deve receber relatos sensíveis em um mural público. Para situações reais de violência, a página `apoio.html` orienta procurar um adulto responsável e os canais institucionais da escola.

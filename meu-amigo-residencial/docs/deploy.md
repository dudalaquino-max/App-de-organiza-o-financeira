# Publicando o Meu Amigo Residencial no Vercel

Este guia parte do princípio de que você só tem uma conta no Vercel. Vamos criar o
banco de dados e o gateway de pagamento durante o processo.

## 1. Banco de dados PostgreSQL

Use o Vercel Postgres (mais simples, já integra com o projeto) ou o Neon (free tier
generoso):

**Opção Vercel Postgres**
1. No dashboard do Vercel, vá em **Storage → Create Database → Postgres**.
2. Depois de criado, na aba **.env.local** copie `POSTGRES_PRISMA_URL` (use como
   `DATABASE_URL`) e `POSTGRES_URL_NON_POOLING` (use como `DIRECT_URL`).

**Opção Neon** (https://neon.tech)
1. Crie um projeto novo, banco `meu_amigo_residencial`.
2. Copie a *connection string* pooled para `DATABASE_URL` e a *direct connection*
   para `DIRECT_URL`.

## 2. Gateway de pagamento (Asaas)

1. Crie uma conta em https://www.asaas.com (comece pelo ambiente sandbox:
   https://sandbox.asaas.com).
2. Em **Integrações → Chave de API**, gere sua `access_token` e use em
   `ASAAS_API_KEY`.
3. Use `ASAAS_API_URL=https://api-sandbox.asaas.com/v3` enquanto estiver testando;
   troque para `https://api.asaas.com/v3` quando for para produção.
4. Em **Integrações → Webhooks**, cadastre a URL
   `https://SEU-DOMINIO.vercel.app/api/webhooks/asaas`, escolha os eventos de
   pagamento (`PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_REFUNDED`,
   `PAYMENT_CHARGEBACK_REQUESTED`) e defina um token de autenticação — use o mesmo
   valor em `ASAAS_WEBHOOK_TOKEN`.

> O app funciona mesmo sem essas chaves configuradas: assinaturas e chamados são
> criados normalmente, só a cobrança automática fica pendente até você configurar o
> Asaas (o erro é registrado no log do servidor, sem quebrar o fluxo do usuário).

## 3. Deploy no Vercel

1. No dashboard do Vercel: **Add New → Project → Import** este repositório Git.
2. Em **Root Directory**, selecione `meu-amigo-residencial` (o app fica num
   subdiretório do monorepo).
3. Framework Preset: Next.js (detectado automaticamente).
4. Em **Environment Variables**, adicione todas as variáveis de `.env.example`:
   - `DATABASE_URL`, `DIRECT_URL`
   - `AUTH_SECRET` (gere com `openssl rand -base64 33`)
   - `AUTH_TRUST_HOST=true`
   - `ASAAS_API_KEY`, `ASAAS_API_URL`, `ASAAS_WEBHOOK_TOKEN`
   - `PLATFORM_FEE_PERCENT=0.03`
5. Clique em **Deploy**. O comando de build (`prisma generate && prisma migrate
   deploy && next build`) já aplica as migrations no banco a cada deploy.

## 4. Criar o primeiro usuário administrador

Não existe cadastro público de admin (por segurança). Rode o seed localmente
apontando para o banco de produção:

```bash
cd meu-amigo-residencial
# use a mesma DATABASE_URL configurada no Vercel
DATABASE_URL="postgresql://..." \
ADMIN_EMAIL="voce@seudominio.com" \
ADMIN_PASSWORD="escolha-uma-senha-forte" \
npm run db:seed
```

Depois disso, acesse `/login` com esse e-mail/senha — o painel fica em `/admin`.

## 5. Roteiro de teste após o deploy

1. Cadastre uma casa como morador (`/cadastro/morador`).
2. Como o bairro é novo, ele cai em lista de espera automaticamente.
3. Faça login como admin, ative o bairro em **Admin → Bairros** e crie um plano em
   **Admin → Planos**.
4. Volte como morador e escolha o plano — isso já dispara a criação do cliente e da
   assinatura no Asaas (se configurado).
5. Cadastre um prestador (`/cadastro/prestador`), aprove-o em **Admin →
   Prestadores** (isso cria a subconta de split no Asaas).
6. Abra um chamado eventual como morador, envie um orçamento como prestador e
   aprove como morador — isso gera a cobrança avulsa com split automático.

## Limitações conhecidas desta primeira versão

- Fotos de chamados/prestadores são links (URL) por enquanto — upload de arquivo
  (ex: Vercel Blob) fica para uma próxima iteração.
- A criação de subconta/split no Asaas assume a API padrão de contas conectadas;
  valide o fluxo de KYC do Asaas para prestadores antes de operar com dinheiro
  real.
- Não há job de cobrança recorrente automática além da chamada inicial ao Asaas —
  o próprio Asaas gerencia as cobranças mensais depois que a assinatura é criada.

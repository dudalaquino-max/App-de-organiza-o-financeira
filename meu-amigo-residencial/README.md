# Meu Amigo Residencial

Plataforma de manutenção residencial coletiva: assinatura recorrente (grama,
vidros, calçada) e marketplace sob demanda (pintura, rachadura, pátio, piscina)
com split de pagamento automático via Asaas.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind · Prisma + PostgreSQL ·
Auth.js (credentials) · Asaas.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, AUTH_SECRET etc.
npx prisma migrate dev
npm run dev
```

Para criar o primeiro usuário administrador:

```bash
ADMIN_EMAIL="voce@exemplo.com" ADMIN_PASSWORD="senha-forte" npm run db:seed
```

## Estrutura

- `src/app/(morador)` — cadastro de casa, planos, chamados
- `src/app/prestador` — chamados disponíveis, orçamentos, extrato
- `src/app/admin` — curadoria de prestadores, bairros, planos, financeiro
- `src/lib/asaas.ts` — integração com o gateway de pagamento (split automático)
- `prisma/schema.prisma` — modelo de dados completo

## Publicar no Vercel

Veja o passo a passo em [`docs/deploy.md`](./docs/deploy.md).

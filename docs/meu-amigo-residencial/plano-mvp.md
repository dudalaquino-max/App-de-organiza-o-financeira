# Meu Amigo Residencial — Plano de MVP

Plataforma de manutenção residencial coletiva para bairros de casas (assinatura recorrente + marketplace sob demanda, com split de pagamento via intermediário).

---

## 1. Fluxo de telas (wireframe em texto)

### 1.1 Morador

**Onboarding**
1. `Splash` → `Login/Cadastro` (e-mail/telefone ou Google/Apple)
2. `Cadastro pessoal` — nome, CPF, telefone
3. `Vincular bairro` — buscar bairro por CEP ou código de convite (bairro precisa estar ativo na plataforma; se não estiver, tela de "lista de espera / indique seu bairro")
4. `Cadastro da casa` — endereço, tem piscina (sim/não), tamanho do terreno/quintal (P/M/G ou m²), fotos opcionais
5. `Escolha de plano` — comparação de pacotes (Básico/Padrão/Premium), preço calculado automaticamente pelo perfil da casa (piscina, tamanho, frequência)
6. `Forma de pagamento` — cartão ou Pix recorrente
7. `Confirmação` → `Home`

**Home / Dashboard**
- Próximo serviço agendado (recorrente) com data/prestador
- Chamados abertos (status: aguardando orçamento / aguardando aprovação / agendado / em execução)
- Atalho "Abrir novo chamado"
- Notificações recentes

**Fluxo de chamado eventual (marketplace)**
1. `Novo chamado` — categoria (pintura, rachadura, pátio, piscina, outro), descrição, fotos, urgência
2. `Aguardando orçamentos` — lista de orçamentos recebidos (prestador, valor, prazo, avaliação do prestador)
3. `Detalhe do orçamento` → `Aprovar` ou `Recusar`/pedir ajuste
4. `Pagamento` — Pix/cartão (indicação de desconto se assinante do plano recorrente)
5. `Execução` — notificação de check-in do prestador, acompanhamento
6. `Conclusão` — fotos antes/depois enviadas pelo prestador → `Avaliar prestador`

**Outras telas**
- `Histórico de serviços` — lista filtrável (recorrente/eventual, por data, por casa) com fotos antes/depois
- `Minha assinatura` — plano atual, próxima cobrança, opção de trocar/cancelar pacote
- `Faturas/Pagamentos` — histórico de cobranças e recibos
- `Perfil` — dados pessoais, casa(s), meios de pagamento, notificações
- `Ajuda/Disputa` — abrir chamado de suporte sobre um serviço específico

### 1.2 Prestador

**Onboarding**
1. `Cadastro` — pessoa física/CNPJ, CPF/CNPJ, telefone, área de atuação (categorias de serviço), raio/bairros de atendimento
2. `Upload de documentos` — documento de identidade, comprovante de endereço, certificações (se aplicável), fotos de portfólio
3. `Dados bancários` — para recebimento via split (conta ou onboarding na conta digital do gateway, ex: sub-conta Asaas/Pagar.me)
4. `Aguardando aprovação` — status pendente até curadoria do admin
5. `Aprovado` → `Home`

**Home / Dashboard**
- Agenda do dia (serviços recorrentes com endereço e horário)
- Chamados eventuais disponíveis para orçar (filtrado por categoria/raio)
- Orçamentos enviados aguardando resposta
- Extrato resumido (a receber / recebido no mês)

**Fluxo de orçamento (marketplace)**
1. `Chamados disponíveis` — lista com descrição, fotos, endereço aproximado
2. `Enviar orçamento` — valor, prazo de execução, observações
3. `Orçamento aprovado` → aparece na agenda com data combinada

**Fluxo de execução**
1. `Check-in` — foto + geolocalização/hora ao chegar
2. `Execução` — pode registrar fotos intermediárias
3. `Check-out` — foto final (depois), marcar como concluído
4. Sistema libera pagamento/repasse conforme regra (imediato ou em janela definida)

**Outras telas**
- `Agenda recorrente` — casas/bairros com datas fixas
- `Extrato financeiro` — repasses (pendente, pago), taxa da plataforma detalhada por transação
- `Avaliações recebidas`
- `Perfil/Portfólio` — fotos de trabalhos anteriores, categorias, raio de atuação

### 1.3 Admin (painel web)

- `Login`
- `Dashboard` — KPIs: bairros ativos, prestadores ativos, GMV, taxa arrecadada (3%), chamados abertos, disputas
- `Bairros` — cadastrar/editar bairro, vincular prestadores habilitados, definir preços base dos pacotes por bairro
- `Prestadores` — fila de aprovação (docs), lista de ativos/suspensos, histórico de avaliações
- `Chamados` — monitoramento geral, filtro por status, intervenção manual em disputas
- `Financeiro` — volume transacionado, taxa arrecadada, repasses por prestador, exportação
- `Pacotes/Preços` — configuração de planos e regras de cálculo por perfil de casa

---

## 2. Modelo de dados (entidades principais)

```
Usuario (base)
 ├─ id, nome, email, telefone, senha_hash, tipo (morador|prestador|admin), criado_em

Bairro
 ├─ id, nome, cidade, estado, status (ativo|lista_espera), regras_preco_base

Morador (1:1 com Usuario)
 ├─ id, usuario_id (FK), cpf

Casa
 ├─ id, morador_id (FK), bairro_id (FK)
 ├─ endereco, cep, tem_piscina (bool), tamanho_terreno (enum: P/M/G ou m²)
 ├─ fotos[]

Prestador (1:1 com Usuario)
 ├─ id, usuario_id (FK), tipo_pessoa (PF|PJ), cpf_cnpj
 ├─ categorias[] (grama, vidros, calcada, pintura, rachadura, patio, piscina)
 ├─ raio_atendimento_km, bairros_habilitados[] (M:N com Bairro)
 ├─ status_aprovacao (pendente|aprovado|reprovado|suspenso)
 ├─ conta_split_id (referência à sub-conta no gateway de pagamento)

DocumentoPrestador
 ├─ id, prestador_id (FK), tipo, url_arquivo, status_validacao

PlanoAssinatura (catálogo, definido pelo admin)
 ├─ id, bairro_id (FK, nullable p/ padrão global), nome, servicos_inclusos[]
 ├─ regras_preco (por tamanho_terreno, tem_piscina, frequencia)

Assinatura (instância contratada pelo morador)
 ├─ id, casa_id (FK), plano_id (FK)
 ├─ valor_mensal, status (ativa|cancelada|inadimplente), forma_pagamento
 ├─ data_inicio, proxima_cobranca

Chamado (marketplace / sob demanda)
 ├─ id, casa_id (FK), categoria, descricao, fotos[]
 ├─ status (aberto|orcado|aprovado|agendado|em_execucao|concluido|cancelado|disputa)
 ├─ criado_em

Orcamento
 ├─ id, chamado_id (FK), prestador_id (FK)
 ├─ valor, prazo_execucao, observacoes, status (pendente|aprovado|recusado)

Agendamento/Execucao
 ├─ id, tipo (recorrente|eventual)
 ├─ assinatura_id (FK, nullable) | chamado_id (FK, nullable)
 ├─ prestador_id (FK), casa_id (FK)
 ├─ data_hora_prevista, checkin_foto, checkin_hora, checkout_foto, checkout_hora
 ├─ status (agendado|em_andamento|concluido|nao_compareceu)

Pagamento
 ├─ id, origem (assinatura_id | chamado_id), morador_id (FK), prestador_id (FK)
 ├─ valor_bruto, taxa_plataforma (≈3%), valor_repasse
 ├─ metodo (pix|cartao), status (pendente|pago|estornado)
 ├─ gateway_transacao_id, data_pagamento

Avaliacao
 ├─ id, origem (agendamento_id), avaliador_id (FK), avaliado_id (FK)
 ├─ nota (1-5), comentario, direcao (morador_para_prestador | prestador_para_morador)

Notificacao
 ├─ id, usuario_id (FK), tipo, mensagem, lida (bool), criado_em

Disputa
 ├─ id, chamado_id ou agendamento_id (FK), aberto_por (FK)
 ├─ motivo, status (aberta|em_analise|resolvida), resolucao
```

**Relacionamentos-chave**
- `Bairro` 1:N `Casa`; `Bairro` M:N `Prestador` (habilitação por região)
- `Casa` 1:N `Assinatura` (histórico, mas só uma ativa por vez) e 1:N `Chamado`
- `Chamado` 1:N `Orcamento`; só um `Orcamento` vira `Agendamento`
- `Pagamento` sempre vinculado a uma `Assinatura` (cobrança recorrente) OU a um `Chamado` (cobrança única) — nunca solto
- `Avaliacao` é bidirecional, sempre atrelada a um `Agendamento` concluído

---

## 3. Stack técnica sugerida (MVP rápido)

| Camada | Sugestão | Por quê |
|---|---|---|
| **App mobile** (morador + prestador) | React Native com Expo | Um único codebase para iOS/Android, ciclo de build/deploy rápido (EAS), grande ecossistema |
| **Painel admin (web)** | Next.js + TypeScript + Tailwind + shadcn/ui | Rápido de montar telas de gestão/tabelas/relatórios, mesmo time/linguagem do mobile (TS) |
| **Backend/API** | NestJS (Node/TypeScript) | Estrutura modular, boa para regras financeiras/multi-tenant, mesma linguagem do front |
| **Banco de dados** | PostgreSQL (gerenciado, ex: Supabase ou RDS) | Relacional é o melhor fit para o modelo acima (bairro, casa, chamado, pagamento com integridade referencial) |
| **Autenticação** | Supabase Auth ou Clerk | Evita construir auth do zero; suporta social login |
| **Armazenamento de fotos** | Supabase Storage / Cloudflare R2 (S3-compatible) | Fotos de antes/depois, documentos de prestadores, portfólio |
| **Pagamento com split** | Asaas ou Pagar.me | Ambos suportam split automático, Pix recorrente, sub-contas com KYC dos prestadores — evita a plataforma reter dinheiro de terceiros (questão regulatória). Asaas costuma ter onboarding mais simples para MVP no Brasil |
| **Notificações push** | Expo Notifications / Firebase Cloud Messaging | Lembretes de agendamento, orçamento recebido, chamado aberto |
| **Infra/deploy (fase MVP)** | Railway, Render ou Fly.io para o backend; Vercel para o painel admin | Deploy rápido, custo baixo, sem overhead de DevOps no início |
| **Observabilidade** | Sentry (erros) + logs do provedor | Necessário desde o MVP por lidar com pagamentos |
| **CI/CD** | GitHub Actions | Build/test automático, deploy no push |

**Observações**
- Multi-tenant por bairro pode começar simples: uma coluna `bairro_id` com escopo de queries (row-level), sem precisar de schema separado por bairro — só migrar para isolamento mais forte se houver exigência de dados sensíveis por bairro.
- Rastreabilidade financeira: gravar sempre o `gateway_transacao_id` retornado pelo provedor de pagamento em `Pagamento`, e nunca calcular repasse manualmente — usar o valor de split retornado pela API do gateway como fonte da verdade.
- **Fase 1 (piloto manual)**: não requer nenhuma dessas ferramentas — WhatsApp + Pix + planilha, validando disposição de pagamento recorrente e aceite da taxa de 3% pelos prestadores antes de investir em desenvolvimento.
- **Fase 2 (MVP)**: começar apenas pelo fluxo de assinatura recorrente (mais simples, cobrança única por casa) e só depois habilitar o marketplace de orçamento (fluxo com mais estados: chamado → orçamento → aprovação → execução → avaliação).

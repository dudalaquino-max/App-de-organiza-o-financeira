-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('MORADOR', 'PRESTADOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusBairro" AS ENUM ('ATIVO', 'LISTA_ESPERA');

-- CreateEnum
CREATE TYPE "TamanhoTerreno" AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE');

-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "CategoriaServico" AS ENUM ('GRAMA', 'VIDROS', 'CALCADA', 'PINTURA', 'RACHADURA', 'PATIO', 'PISCINA', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusAprovacaoPrestador" AS ENUM ('PENDENTE', 'APROVADO', 'REPROVADO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "StatusDocumento" AS ENUM ('PENDENTE', 'VALIDADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'CANCELADA', 'INADIMPLENTE');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'CARTAO');

-- CreateEnum
CREATE TYPE "StatusChamado" AS ENUM ('ABERTO', 'ORCADO', 'APROVADO', 'AGENDADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO', 'DISPUTA');

-- CreateEnum
CREATE TYPE "StatusOrcamento" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "TipoAgendamento" AS ENUM ('RECORRENTE', 'EVENTUAL');

-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'NAO_COMPARECEU');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PAGO', 'ESTORNADO', 'FALHOU');

-- CreateEnum
CREATE TYPE "DirecaoAvaliacao" AS ENUM ('MORADOR_PARA_PRESTADOR', 'PRESTADOR_PARA_MORADOR');

-- CreateEnum
CREATE TYPE "StatusDisputa" AS ENUM ('ABERTA', 'EM_ANALISE', 'RESOLVIDA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "senhaHash" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bairros" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "status" "StatusBairro" NOT NULL DEFAULT 'LISTA_ESPERA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bairros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moradores" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "asaasCustomerId" TEXT,

    CONSTRAINT "moradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casas" (
    "id" TEXT NOT NULL,
    "moradorId" TEXT NOT NULL,
    "bairroId" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "temPiscina" BOOLEAN NOT NULL DEFAULT false,
    "tamanhoTerreno" "TamanhoTerreno" NOT NULL,
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "casas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestadores" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoPessoa" "TipoPessoa" NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "categorias" "CategoriaServico"[],
    "raioAtendimentoKm" INTEGER NOT NULL DEFAULT 10,
    "statusAprovacao" "StatusAprovacaoPrestador" NOT NULL DEFAULT 'PENDENTE',
    "contaSplitId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prestadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestador_bairros" (
    "id" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "bairroId" TEXT NOT NULL,

    CONSTRAINT "prestador_bairros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_prestador" (
    "id" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "urlArquivo" TEXT NOT NULL,
    "statusValidacao" "StatusDocumento" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_prestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_assinatura" (
    "id" TEXT NOT NULL,
    "bairroId" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "servicosInclusos" "CategoriaServico"[],
    "precoBaseP" DECIMAL(10,2) NOT NULL,
    "precoBaseM" DECIMAL(10,2) NOT NULL,
    "precoBaseG" DECIMAL(10,2) NOT NULL,
    "adicionalPiscina" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planos_assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
    "id" TEXT NOT NULL,
    "casaId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "valorMensal" DECIMAL(10,2) NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "formaPagamento" "FormaPagamento" NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proximaCobranca" TIMESTAMP(3),

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamados" (
    "id" TEXT NOT NULL,
    "casaId" TEXT NOT NULL,
    "categoria" "CategoriaServico" NOT NULL,
    "descricao" TEXT NOT NULL,
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "StatusChamado" NOT NULL DEFAULT 'ABERTO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL,
    "chamadoId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "prazoExecucao" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" "StatusOrcamento" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAgendamento" NOT NULL,
    "assinaturaId" TEXT,
    "chamadoId" TEXT,
    "prestadorId" TEXT NOT NULL,
    "casaId" TEXT NOT NULL,
    "dataHoraPrevista" TIMESTAMP(3) NOT NULL,
    "checkinFoto" TEXT,
    "checkinHora" TIMESTAMP(3),
    "checkoutFoto" TEXT,
    "checkoutHora" TIMESTAMP(3),
    "status" "StatusAgendamento" NOT NULL DEFAULT 'AGENDADO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT,
    "chamadoId" TEXT,
    "prestadorId" TEXT,
    "valorBruto" DECIMAL(10,2) NOT NULL,
    "taxaPlataforma" DECIMAL(10,2) NOT NULL,
    "valorRepasse" DECIMAL(10,2) NOT NULL,
    "metodo" "FormaPagamento" NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "gatewayTransacaoId" TEXT,
    "linkPagamento" TEXT,
    "dataPagamento" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "avaliadorId" TEXT NOT NULL,
    "avaliadoId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "direcao" "DirecaoAvaliacao" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputas" (
    "id" TEXT NOT NULL,
    "chamadoId" TEXT,
    "agendamentoId" TEXT,
    "abertoPor" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "status" "StatusDisputa" NOT NULL DEFAULT 'ABERTA',
    "resolucao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disputas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bairros_nome_cidade_estado_key" ON "bairros"("nome", "cidade", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "moradores_usuarioId_key" ON "moradores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "moradores_cpf_key" ON "moradores"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "prestadores_usuarioId_key" ON "prestadores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "prestadores_cpfCnpj_key" ON "prestadores"("cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "prestador_bairros_prestadorId_bairroId_key" ON "prestador_bairros"("prestadorId", "bairroId");

-- CreateIndex
CREATE UNIQUE INDEX "agendamentos_chamadoId_key" ON "agendamentos"("chamadoId");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_chamadoId_key" ON "pagamentos"("chamadoId");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_gatewayTransacaoId_key" ON "pagamentos"("gatewayTransacaoId");

-- AddForeignKey
ALTER TABLE "moradores" ADD CONSTRAINT "moradores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casas" ADD CONSTRAINT "casas_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES "moradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casas" ADD CONSTRAINT "casas_bairroId_fkey" FOREIGN KEY ("bairroId") REFERENCES "bairros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestadores" ADD CONSTRAINT "prestadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestador_bairros" ADD CONSTRAINT "prestador_bairros_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestador_bairros" ADD CONSTRAINT "prestador_bairros_bairroId_fkey" FOREIGN KEY ("bairroId") REFERENCES "bairros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_prestador" ADD CONSTRAINT "documentos_prestador_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_assinatura" ADD CONSTRAINT "planos_assinatura_bairroId_fkey" FOREIGN KEY ("bairroId") REFERENCES "bairros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_casaId_fkey" FOREIGN KEY ("casaId") REFERENCES "casas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos_assinatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_casaId_fkey" FOREIGN KEY ("casaId") REFERENCES "casas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "assinaturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_casaId_fkey" FOREIGN KEY ("casaId") REFERENCES "casas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "assinaturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

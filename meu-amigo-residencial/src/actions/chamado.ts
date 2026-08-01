"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CategoriaServico } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { calcularTaxaPlataforma } from "@/lib/precos";
import { AsaasConfigError, criarClienteAsaas, criarCobrancaAvulsa } from "@/lib/asaas";
import type { ActionState } from "@/actions/auth";

const criarChamadoSchema = z.object({
  casaId: z.string().min(1),
  categoria: z.enum([
    "GRAMA",
    "VIDROS",
    "CALCADA",
    "PINTURA",
    "RACHADURA",
    "PATIO",
    "PISCINA",
    "OUTRO",
  ]),
  descricao: z.string().min(10, "Descreva o serviço com mais detalhes"),
  fotos: z.string().optional(),
});

export async function criarChamado(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "MORADOR") {
    return { error: "Faça login como morador para continuar" };
  }

  const parsed = criarChamadoSchema.safeParse({
    casaId: formData.get("casaId"),
    categoria: formData.get("categoria"),
    descricao: formData.get("descricao"),
    fotos: formData.get("fotos"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const casa = await prisma.casa.findUnique({
    where: { id: parsed.data.casaId },
    include: { morador: true },
  });
  if (!casa || casa.morador.usuarioId !== session.user.id) {
    return { error: "Casa não encontrada" };
  }

  const fotos = (parsed.data.fotos ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const chamado = await prisma.chamado.create({
    data: {
      casaId: casa.id,
      categoria: parsed.data.categoria as CategoriaServico,
      descricao: parsed.data.descricao,
      fotos,
    },
  });

  redirect(`/morador/chamados/${chamado.id}`);
}

const orcamentoSchema = z.object({
  chamadoId: z.string().min(1),
  valor: z.coerce.number().positive("Informe um valor válido"),
  prazoExecucao: z.string().min(2, "Informe o prazo"),
  observacoes: z.string().optional(),
});

export async function enviarOrcamento(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "PRESTADOR") {
    return { error: "Faça login como prestador para continuar" };
  }

  const parsed = orcamentoSchema.safeParse({
    chamadoId: formData.get("chamadoId"),
    valor: formData.get("valor"),
    prazoExecucao: formData.get("prazoExecucao"),
    observacoes: formData.get("observacoes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const prestador = await prisma.prestador.findUnique({ where: { usuarioId: session.user.id } });
  if (!prestador || prestador.statusAprovacao !== "APROVADO") {
    return { error: "Sua conta ainda não foi aprovada pela curadoria" };
  }

  const chamado = await prisma.chamado.findUnique({ where: { id: parsed.data.chamadoId } });
  if (!chamado) return { error: "Chamado não encontrado" };

  await prisma.orcamento.create({
    data: {
      chamadoId: chamado.id,
      prestadorId: prestador.id,
      valor: parsed.data.valor,
      prazoExecucao: parsed.data.prazoExecucao,
      observacoes: parsed.data.observacoes,
    },
  });

  if (chamado.status === "ABERTO") {
    await prisma.chamado.update({ where: { id: chamado.id }, data: { status: "ORCADO" } });
  }

  redirect("/prestador/orcamentos");
}

export async function aprovarOrcamentoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const orcamentoId = formData.get("orcamentoId") as string;
  const resultado = await aprovarOrcamento(orcamentoId);
  if (resultado.error) return resultado;
  const chamadoId = formData.get("chamadoId") as string;
  revalidatePath(`/morador/chamados/${chamadoId}`);
}

export async function aprovarOrcamento(orcamentoId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "MORADOR") {
    return { error: "Faça login como morador para continuar" };
  }

  const orcamento = await prisma.orcamento.findUnique({
    where: { id: orcamentoId },
    include: {
      chamado: { include: { casa: { include: { morador: true } } } },
      prestador: true,
    },
  });
  if (!orcamento || orcamento.chamado.casa.morador.usuarioId !== session.user.id) {
    return { error: "Orçamento não encontrado" };
  }

  await prisma.$transaction([
    prisma.orcamento.update({ where: { id: orcamento.id }, data: { status: "APROVADO" } }),
    prisma.orcamento.updateMany({
      where: { chamadoId: orcamento.chamadoId, id: { not: orcamento.id } },
      data: { status: "RECUSADO" },
    }),
    prisma.chamado.update({ where: { id: orcamento.chamadoId }, data: { status: "APROVADO" } }),
  ]);

  const agendamento = await prisma.agendamento.create({
    data: {
      tipo: "EVENTUAL",
      chamadoId: orcamento.chamadoId,
      prestadorId: orcamento.prestadorId,
      casaId: orcamento.chamado.casaId,
      dataHoraPrevista: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.chamado.update({ where: { id: orcamento.chamadoId }, data: { status: "AGENDADO" } });
  void agendamento;

  const { taxa, repasse } = calcularTaxaPlataforma(new Decimal(orcamento.valor));
  const pagamento = await prisma.pagamento.create({
    data: {
      chamadoId: orcamento.chamadoId,
      prestadorId: orcamento.prestadorId,
      valorBruto: orcamento.valor,
      taxaPlataforma: taxa,
      valorRepasse: repasse,
      metodo: "PIX",
      status: "PENDENTE",
    },
  });

  try {
    const morador = orcamento.chamado.casa.morador;
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: morador.usuarioId } });

    let asaasCustomerId = morador.asaasCustomerId;
    if (!asaasCustomerId) {
      const cliente = await criarClienteAsaas({
        name: usuario.nome,
        cpfCnpj: morador.cpf,
        email: usuario.email,
        mobilePhone: usuario.telefone ?? undefined,
      });
      asaasCustomerId = cliente.id;
      await prisma.morador.update({ where: { id: morador.id }, data: { asaasCustomerId } });
    }

    const vencimento = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const cobranca = await criarCobrancaAvulsa({
      customerId: asaasCustomerId,
      valor: Number(orcamento.valor),
      descricao: `Chamado ${orcamento.chamadoId} — ${orcamento.chamado.categoria}`,
      vencimento,
      formaPagamento: "PIX",
      walletIdPrestador: orcamento.prestador.contaSplitId ?? undefined,
    });

    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: { gatewayTransacaoId: cobranca.id, linkPagamento: cobranca.invoiceUrl },
    });
  } catch (err) {
    if (!(err instanceof AsaasConfigError)) {
      console.error("Falha ao criar cobrança no Asaas", err);
    }
  }

  return {};
}

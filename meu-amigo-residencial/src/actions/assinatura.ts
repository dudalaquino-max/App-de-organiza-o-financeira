"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calcularPrecoPlano, calcularTaxaPlataforma } from "@/lib/precos";
import { AsaasConfigError, criarAssinaturaRecorrente, criarClienteAsaas } from "@/lib/asaas";
import type { ActionState } from "@/actions/auth";
import { Decimal } from "@prisma/client/runtime/library";

const schema = z.object({
  casaId: z.string().min(1),
  planoId: z.string().min(1),
  formaPagamento: z.enum(["PIX", "CARTAO"]),
});

export async function assinarPlano(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "MORADOR") {
    return { error: "Faça login como morador para continuar" };
  }

  const parsed = schema.safeParse({
    casaId: formData.get("casaId"),
    planoId: formData.get("planoId"),
    formaPagamento: formData.get("formaPagamento"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { casaId, planoId, formaPagamento } = parsed.data;

  const casa = await prisma.casa.findUnique({
    where: { id: casaId },
    include: { morador: true },
  });
  if (!casa || casa.morador.usuarioId !== session.user.id) {
    return { error: "Casa não encontrada" };
  }

  const plano = await prisma.planoAssinatura.findUnique({ where: { id: planoId } });
  if (!plano) return { error: "Plano não encontrado" };

  const valorMensal = calcularPrecoPlano(plano, casa.tamanhoTerreno, casa.temPiscina);

  const assinatura = await prisma.assinatura.create({
    data: {
      casaId: casa.id,
      planoId: plano.id,
      valorMensal,
      formaPagamento,
      status: "ATIVA",
    },
  });

  const { taxa, repasse } = calcularTaxaPlataforma(new Decimal(valorMensal));
  const pagamento = await prisma.pagamento.create({
    data: {
      assinaturaId: assinatura.id,
      valorBruto: valorMensal,
      taxaPlataforma: taxa,
      valorRepasse: repasse,
      metodo: formaPagamento,
      status: "PENDENTE",
    },
  });

  try {
    const morador = await prisma.morador.findUniqueOrThrow({ where: { id: casa.moradorId } });
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

    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const assinaturaAsaas = await criarAssinaturaRecorrente({
      customerId: asaasCustomerId,
      valor: Number(valorMensal),
      descricao: `Plano ${plano.nome} — ${casa.endereco}`,
      proximoVencimento: amanha,
      formaPagamento,
    });

    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: { gatewayTransacaoId: assinaturaAsaas.id },
    });

    await prisma.assinatura.update({
      where: { id: assinatura.id },
      data: { proximaCobranca: new Date(amanha) },
    });
  } catch (err) {
    if (!(err instanceof AsaasConfigError)) {
      console.error("Falha ao criar cobrança no Asaas", err);
    }
    // A assinatura e o pagamento pendente ficam registrados; a cobrança no
    // gateway pode ser retomada assim que ele estiver configurado (ver
    // docs/deploy.md).
  }

  redirect("/morador");
}

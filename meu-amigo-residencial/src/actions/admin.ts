"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AsaasConfigError, criarSubcontaPrestador } from "@/lib/asaas";
import type { ActionState } from "@/actions/auth";
import { CategoriaServico } from "@prisma/client";

async function exigirAdmin() {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "ADMIN") {
    throw new Error("Acesso restrito ao administrador");
  }
  return session;
}

export async function aprovarPrestador(prestadorId: string) {
  await exigirAdmin();

  const prestador = await prisma.prestador.findUniqueOrThrow({
    where: { id: prestadorId },
    include: { usuario: true },
  });

  let contaSplitId = prestador.contaSplitId;
  try {
    if (!contaSplitId) {
      const subconta = await criarSubcontaPrestador({
        name: prestador.usuario.nome,
        cpfCnpj: prestador.cpfCnpj,
        email: prestador.usuario.email,
        mobilePhone: prestador.usuario.telefone ?? undefined,
      });
      contaSplitId = subconta.walletId;
    }
  } catch (err) {
    if (!(err instanceof AsaasConfigError)) {
      console.error("Falha ao criar subconta no Asaas", err);
    }
  }

  await prisma.prestador.update({
    where: { id: prestadorId },
    data: { statusAprovacao: "APROVADO", contaSplitId },
  });

  revalidatePath("/admin/prestadores");
}

export async function reprovarPrestador(prestadorId: string) {
  await exigirAdmin();
  await prisma.prestador.update({
    where: { id: prestadorId },
    data: { statusAprovacao: "REPROVADO" },
  });
  revalidatePath("/admin/prestadores");
}

const bairroSchema = z.object({
  nome: z.string().min(2),
  cidade: z.string().min(2),
  estado: z.string().length(2),
});

export async function criarBairro(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await exigirAdmin();

  const parsed = bairroSchema.safeParse({
    nome: formData.get("nome"),
    cidade: formData.get("cidade"),
    estado: (formData.get("estado") as string)?.toUpperCase(),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.bairro.upsert({
    where: {
      nome_cidade_estado: {
        nome: parsed.data.nome,
        cidade: parsed.data.cidade,
        estado: parsed.data.estado,
      },
    },
    update: {},
    create: { ...parsed.data, status: "ATIVO" },
  });

  revalidatePath("/admin/bairros");
}

export async function ativarBairro(bairroId: string) {
  await exigirAdmin();
  await prisma.bairro.update({ where: { id: bairroId }, data: { status: "ATIVO" } });
  revalidatePath("/admin/bairros");
}

const planoSchema = z.object({
  bairroId: z.string().optional(),
  nome: z.string().min(2),
  descricao: z.string().optional(),
  servicosInclusos: z.array(z.string()).min(1),
  precoBaseP: z.coerce.number().positive(),
  precoBaseM: z.coerce.number().positive(),
  precoBaseG: z.coerce.number().positive(),
  adicionalPiscina: z.coerce.number().min(0),
});

export async function criarPlano(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await exigirAdmin();

  const parsed = planoSchema.safeParse({
    bairroId: formData.get("bairroId") || undefined,
    nome: formData.get("nome"),
    descricao: formData.get("descricao") || undefined,
    servicosInclusos: formData.getAll("servicosInclusos"),
    precoBaseP: formData.get("precoBaseP"),
    precoBaseM: formData.get("precoBaseM"),
    precoBaseG: formData.get("precoBaseG"),
    adicionalPiscina: formData.get("adicionalPiscina"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.planoAssinatura.create({
    data: {
      ...parsed.data,
      servicosInclusos: parsed.data.servicosInclusos as CategoriaServico[],
      bairroId: parsed.data.bairroId ?? null,
    },
  });

  revalidatePath("/admin/planos");
}

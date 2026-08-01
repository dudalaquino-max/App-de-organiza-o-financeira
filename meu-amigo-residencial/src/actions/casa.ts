"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TamanhoTerreno } from "@prisma/client";
import type { ActionState } from "@/actions/auth";

const bairroSchema = z.object({
  nomeBairro: z.string().min(2, "Informe o nome do bairro"),
  cidade: z.string().min(2, "Informe a cidade"),
  estado: z.string().length(2, "Use a sigla do estado, ex: SP"),
  endereco: z.string().min(5, "Informe o endereço"),
  cep: z.string().min(8, "CEP inválido"),
  tamanhoTerreno: z.enum(["PEQUENO", "MEDIO", "GRANDE"]),
  temPiscina: z.coerce.boolean(),
});

export async function cadastrarCasa(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "MORADOR") {
    return { error: "Faça login como morador para continuar" };
  }

  const parsed = bairroSchema.safeParse({
    nomeBairro: formData.get("nomeBairro"),
    cidade: formData.get("cidade"),
    estado: (formData.get("estado") as string)?.toUpperCase(),
    endereco: formData.get("endereco"),
    cep: formData.get("cep"),
    tamanhoTerreno: formData.get("tamanhoTerreno"),
    temPiscina: formData.get("temPiscina") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const morador = await prisma.morador.findUnique({ where: { usuarioId: session.user.id } });
  if (!morador) return { error: "Cadastro de morador não encontrado" };

  const { nomeBairro, cidade, estado, endereco, cep, tamanhoTerreno, temPiscina } = parsed.data;

  const bairro = await prisma.bairro.upsert({
    where: { nome_cidade_estado: { nome: nomeBairro, cidade, estado } },
    update: {},
    create: { nome: nomeBairro, cidade, estado, status: "LISTA_ESPERA" },
  });

  const casa = await prisma.casa.create({
    data: {
      moradorId: morador.id,
      bairroId: bairro.id,
      endereco,
      cep,
      tamanhoTerreno: tamanhoTerreno as TamanhoTerreno,
      temPiscina,
    },
  });

  if (bairro.status === "LISTA_ESPERA") {
    redirect(`/morador/casa/${casa.id}/lista-espera`);
  }

  redirect(`/morador/planos/${casa.id}`);
}

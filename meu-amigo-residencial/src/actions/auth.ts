"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { CategoriaServico, TipoPessoa } from "@prisma/client";

export type ActionState = { error?: string } | undefined;

const cadastroMoradorSchema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export async function cadastrarMorador(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = cadastroMoradorSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    cpf: formData.get("cpf"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { nome, email, telefone, cpf, senha } = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return { error: "Já existe uma conta com esse e-mail" };

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: {
      nome,
      email,
      telefone,
      senhaHash,
      tipo: "MORADOR",
      morador: { create: { cpf } },
    },
  });

  await signIn("credentials", { email, senha, redirectTo: "/morador/casa/nova" });
}

const cadastroPrestadorSchema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
  tipoPessoa: z.enum(["PF", "PJ"]),
  cpfCnpj: z.string().min(11, "Documento inválido"),
  categorias: z.array(z.string()).min(1, "Selecione ao menos uma categoria"),
  raioAtendimentoKm: z.coerce.number().min(1).max(100),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export async function cadastrarPrestador(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = cadastroPrestadorSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    tipoPessoa: formData.get("tipoPessoa"),
    cpfCnpj: formData.get("cpfCnpj"),
    categorias: formData.getAll("categorias"),
    raioAtendimentoKm: formData.get("raioAtendimentoKm"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { nome, email, telefone, tipoPessoa, cpfCnpj, categorias, raioAtendimentoKm, senha } =
    parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return { error: "Já existe uma conta com esse e-mail" };

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: {
      nome,
      email,
      telefone,
      senhaHash,
      tipo: "PRESTADOR",
      prestador: {
        create: {
          tipoPessoa: tipoPessoa as TipoPessoa,
          cpfCnpj,
          categorias: categorias as CategoriaServico[],
          raioAtendimentoKm,
        },
      },
    },
  });

  await signIn("credentials", { email, senha, redirectTo: "/prestador" });
}

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

export async function fazerLogin(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  const destino =
    usuario?.tipo === "PRESTADOR" ? "/prestador" : usuario?.tipo === "ADMIN" ? "/admin" : "/morador";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      senha: parsed.data.senha,
      redirectTo: destino,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("CredentialsSignin")) {
      return { error: "E-mail ou senha incorretos" };
    }
    throw err;
  }
}

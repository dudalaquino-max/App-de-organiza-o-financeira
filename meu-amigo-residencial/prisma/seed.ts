import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_PASSWORD;

  if (!email || !senha) {
    console.log("Defina ADMIN_EMAIL e ADMIN_PASSWORD para criar o usuário administrador.");
    return;
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log(`Usuário admin ${email} já existe.`);
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.create({
    data: { nome: "Administrador", email, senhaHash, tipo: "ADMIN" },
  });

  console.log(`Usuário admin ${email} criado com sucesso.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

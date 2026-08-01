import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NovoChamadoForm } from "@/components/forms/NovoChamadoForm";

export default async function NovoChamadoPage() {
  const session = await auth();
  const morador = await prisma.morador.findUnique({
    where: { usuarioId: session!.user.id },
    include: { casas: true },
  });

  if (!morador || morador.casas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-600">
        Cadastre uma casa antes de abrir um chamado.{" "}
        <Link href="/morador/casa/nova" className="text-emerald-700 hover:underline">
          Cadastrar casa
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-semibold">Abrir chamado</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Prestadores do seu bairro poderão enviar orçamentos para este serviço.
      </p>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <NovoChamadoForm casas={morador.casas} />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ListaEsperaPage({
  params,
}: {
  params: Promise<{ casaId: string }>;
}) {
  const { casaId } = await params;
  const casa = await prisma.casa.findUnique({
    where: { id: casaId },
    include: { bairro: true },
  });

  if (!casa) notFound();

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
      <h1 className="text-lg font-semibold text-amber-900">
        {casa.bairro.nome} ainda não está ativo
      </h1>
      <p className="mt-2 text-sm text-amber-800">
        Sua casa foi cadastrada e seu bairro entrou na lista de espera. Assim que tivermos
        prestadores curados na região, avisaremos você por e-mail para escolher seu plano.
      </p>
    </div>
  );
}

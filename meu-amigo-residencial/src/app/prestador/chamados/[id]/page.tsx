import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS_LABEL } from "@/lib/enums";
import { EnviarOrcamentoForm } from "@/components/forms/EnviarOrcamentoForm";

export default async function ChamadoDisponivelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const prestador = await prisma.prestador.findUnique({ where: { usuarioId: session!.user.id } });
  if (!prestador) notFound();

  const chamado = await prisma.chamado.findUnique({
    where: { id },
    include: { casa: { include: { bairro: true } } },
  });
  if (!chamado) notFound();

  const jaEnviou = await prisma.orcamento.findFirst({
    where: { chamadoId: chamado.id, prestadorId: prestador.id },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {CATEGORIAS_LABEL[chamado.categoria]} — {chamado.casa.bairro.nome}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">{chamado.descricao}</p>
        {chamado.fotos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chamado.fotos.map((foto) => (
              <a
                key={foto}
                href={foto}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 underline"
              >
                Ver foto
              </a>
            ))}
          </div>
        )}
      </div>

      {jaEnviou ? (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
          Você já enviou um orçamento de R$ {jaEnviou.valor.toFixed(2)} para este chamado
          (status: {jaEnviou.status}).
        </p>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <EnviarOrcamentoForm chamadoId={chamado.id} />
        </div>
      )}
    </div>
  );
}

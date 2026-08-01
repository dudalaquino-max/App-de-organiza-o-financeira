import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS_LABEL } from "@/lib/enums";

export default async function ChamadosDisponiveisPage() {
  const session = await auth();
  const prestador = await prisma.prestador.findUnique({ where: { usuarioId: session!.user.id } });
  if (!prestador || prestador.statusAprovacao !== "APROVADO") return null;

  const chamados = await prisma.chamado.findMany({
    where: {
      status: { in: ["ABERTO", "ORCADO"] },
      categoria: { in: prestador.categorias },
      orcamentos: { none: { prestadorId: prestador.id } },
    },
    include: { casa: { include: { bairro: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Chamados disponíveis</h1>
      {chamados.length === 0 ? (
        <p className="text-neutral-500">Nenhum chamado disponível na sua área no momento.</p>
      ) : (
        <div className="space-y-3">
          {chamados.map((chamado) => (
            <Link
              key={chamado.id}
              href={`/prestador/chamados/${chamado.id}`}
              className="block rounded-xl border border-neutral-200 bg-white p-4 hover:border-emerald-300"
            >
              <p className="font-medium text-neutral-900">
                {CATEGORIAS_LABEL[chamado.categoria]} — {chamado.casa.bairro.nome}
              </p>
              <p className="text-sm text-neutral-500">{chamado.descricao.slice(0, 100)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

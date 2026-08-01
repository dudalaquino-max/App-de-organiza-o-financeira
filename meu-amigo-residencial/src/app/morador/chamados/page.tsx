import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS_LABEL, STATUS_CHAMADO_LABEL } from "@/lib/enums";

export default async function ChamadosPage() {
  const session = await auth();
  const chamados = await prisma.chamado.findMany({
    where: { casa: { morador: { usuarioId: session!.user.id } } },
    include: { casa: true, orcamentos: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Meus chamados</h1>
        <Link
          href="/morador/chamados/novo"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Abrir chamado
        </Link>
      </div>

      {chamados.length === 0 ? (
        <p className="text-neutral-500">Nenhum chamado ainda.</p>
      ) : (
        <div className="space-y-3">
          {chamados.map((chamado) => (
            <Link
              key={chamado.id}
              href={`/morador/chamados/${chamado.id}`}
              className="block rounded-xl border border-neutral-200 bg-white p-4 hover:border-emerald-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">
                    {CATEGORIAS_LABEL[chamado.categoria]} — {chamado.casa.endereco}
                  </p>
                  <p className="text-sm text-neutral-500">{chamado.descricao.slice(0, 80)}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium text-neutral-700">
                    {STATUS_CHAMADO_LABEL[chamado.status]}
                  </p>
                  <p className="text-neutral-400">
                    {chamado.orcamentos.length} orçamento(s)
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

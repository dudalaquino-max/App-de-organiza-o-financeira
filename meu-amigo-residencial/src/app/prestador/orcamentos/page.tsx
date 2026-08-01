import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS_LABEL } from "@/lib/enums";

export default async function MeusOrcamentosPage() {
  const session = await auth();
  const prestador = await prisma.prestador.findUnique({ where: { usuarioId: session!.user.id } });
  if (!prestador) return null;

  const orcamentos = await prisma.orcamento.findMany({
    where: { prestadorId: prestador.id },
    include: { chamado: { include: { casa: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Meus orçamentos</h1>
      {orcamentos.length === 0 ? (
        <p className="text-neutral-500">Você ainda não enviou orçamentos.</p>
      ) : (
        <div className="space-y-3">
          {orcamentos.map((orc) => (
            <div key={orc.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">
                    {CATEGORIAS_LABEL[orc.chamado.categoria]} — {orc.chamado.casa.endereco}
                  </p>
                  <p className="text-sm text-neutral-500">Prazo: {orc.prazoExecucao}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">R$ {orc.valor.toFixed(2)}</p>
                  <p className="text-xs text-neutral-400">{orc.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

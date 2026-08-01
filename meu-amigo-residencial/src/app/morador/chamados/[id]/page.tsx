import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS_LABEL, STATUS_CHAMADO_LABEL } from "@/lib/enums";
import { AprovarOrcamentoForm } from "@/components/forms/AprovarOrcamentoForm";

export default async function ChamadoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const chamado = await prisma.chamado.findUnique({
    where: { id },
    include: {
      casa: { include: { morador: true } },
      orcamentos: { include: { prestador: { include: { usuario: true } } } },
      agendamento: true,
      pagamento: true,
    },
  });

  if (!chamado || chamado.casa.morador.usuarioId !== session?.user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {CATEGORIAS_LABEL[chamado.categoria]} — {chamado.casa.endereco}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{chamado.descricao}</p>
        <span className="mt-2 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
          {STATUS_CHAMADO_LABEL[chamado.status]}
        </span>
      </div>

      {chamado.pagamento && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-medium text-emerald-900">Pagamento</p>
          <p className="text-sm text-emerald-800">
            R$ {chamado.pagamento.valorBruto.toFixed(2)} — status: {chamado.pagamento.status}
          </p>
          {chamado.pagamento.linkPagamento && (
            <a
              href={chamado.pagamento.linkPagamento}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-emerald-700 underline"
            >
              Pagar agora
            </a>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 font-medium text-neutral-900">Orçamentos recebidos</h2>
        {chamado.orcamentos.length === 0 ? (
          <p className="text-sm text-neutral-500">Aguardando orçamentos de prestadores.</p>
        ) : (
          <div className="space-y-3">
            {chamado.orcamentos.map((orc) => (
              <div key={orc.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{orc.prestador.usuario.nome}</p>
                    <p className="text-sm text-neutral-500">Prazo: {orc.prazoExecucao}</p>
                    {orc.observacoes && (
                      <p className="mt-1 text-sm text-neutral-500">{orc.observacoes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-neutral-900">
                      R$ {orc.valor.toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-400">{orc.status}</p>
                  </div>
                </div>
                {orc.status === "PENDENTE" && chamado.status === "ORCADO" && (
                  <div className="mt-3">
                    <AprovarOrcamentoForm orcamentoId={orc.id} chamadoId={chamado.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

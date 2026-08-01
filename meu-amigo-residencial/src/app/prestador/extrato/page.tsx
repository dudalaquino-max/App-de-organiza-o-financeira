import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ExtratoPage() {
  const session = await auth();
  const prestador = await prisma.prestador.findUnique({ where: { usuarioId: session!.user.id } });
  if (!prestador) return null;

  const pagamentos = await prisma.pagamento.findMany({
    where: { prestadorId: prestador.id },
    orderBy: { criadoEm: "desc" },
  });

  const totalRecebido = pagamentos
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => acc + Number(p.valorRepasse), 0);
  const totalPendente = pagamentos
    .filter((p) => p.status === "PENDENTE")
    .reduce((acc, p) => acc + Number(p.valorRepasse), 0);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Extrato financeiro</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Recebido</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">
            R$ {totalRecebido.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">A receber</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            R$ {totalPendente.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {pagamentos.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 text-sm"
          >
            <div>
              <p className="text-neutral-900">
                Bruto R$ {p.valorBruto.toFixed(2)} · taxa R$ {p.taxaPlataforma.toFixed(2)}
              </p>
              <p className="text-neutral-500">{new Date(p.criadoEm).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-neutral-900">Repasse R$ {p.valorRepasse.toFixed(2)}</p>
              <p className="text-xs text-neutral-400">{p.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

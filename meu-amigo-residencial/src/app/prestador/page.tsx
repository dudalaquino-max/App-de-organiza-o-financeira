import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS_LABEL } from "@/lib/enums";

export default async function PrestadorHomePage() {
  const session = await auth();
  const prestador = await prisma.prestador.findUnique({
    where: { usuarioId: session!.user.id },
  });

  if (!prestador) return null;

  if (prestador.statusAprovacao === "PENDENTE") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-amber-900">Cadastro em análise</h1>
        <p className="mt-2 text-sm text-amber-800">
          Nossa curadoria está avaliando seus documentos. Você será notificado assim que sua
          conta for aprovada e poderá começar a orçar chamados.
        </p>
      </div>
    );
  }

  if (prestador.statusAprovacao === "REPROVADO" || prestador.statusAprovacao === "SUSPENSO") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-red-900">Conta não habilitada</h1>
        <p className="mt-2 text-sm text-red-800">
          Entre em contato com o suporte para mais informações sobre sua conta.
        </p>
      </div>
    );
  }

  const [chamadosDisponiveis, proximosAgendamentos] = await Promise.all([
    prisma.chamado.count({
      where: { status: { in: ["ABERTO", "ORCADO"] }, categoria: { in: prestador.categorias } },
    }),
    prisma.agendamento.findMany({
      where: { prestadorId: prestador.id, status: "AGENDADO" },
      orderBy: { dataHoraPrevista: "asc" },
      take: 5,
      include: { casa: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Chamados disponíveis para orçar</p>
          <p className="mt-1 text-3xl font-semibold text-neutral-900">{chamadosDisponiveis}</p>
          <Link href="/prestador/chamados" className="mt-3 inline-block text-sm text-emerald-700 hover:underline">
            Ver chamados
          </Link>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Categorias habilitadas</p>
          <p className="mt-1 text-sm text-neutral-800">
            {prestador.categorias.map((c) => CATEGORIAS_LABEL[c]).join(", ")}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-medium text-neutral-900">Próximos agendamentos</h2>
        {proximosAgendamentos.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum agendamento no momento.</p>
        ) : (
          <div className="space-y-2">
            {proximosAgendamentos.map((ag) => (
              <div key={ag.id} className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
                <p className="font-medium text-neutral-900">{ag.casa.endereco}</p>
                <p className="text-neutral-500">
                  {new Date(ag.dataHoraPrevista).toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

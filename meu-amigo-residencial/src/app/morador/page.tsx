import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_CHAMADO_LABEL, TAMANHO_LABEL } from "@/lib/enums";

export default async function MoradorHomePage() {
  const session = await auth();
  const morador = await prisma.morador.findUnique({
    where: { usuarioId: session!.user.id },
    include: {
      casas: {
        include: {
          bairro: true,
          assinaturas: { where: { status: "ATIVA" }, include: { plano: true } },
          chamados: { orderBy: { criadoEm: "desc" }, take: 5 },
        },
      },
    },
  });

  if (!morador || morador.casas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-neutral-600">Você ainda não cadastrou nenhuma casa.</p>
        <Link
          href="/morador/casa/nova"
          className="mt-4 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Cadastrar minha casa
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Minhas casas</h1>
      {morador.casas.map((casa) => (
        <div key={casa.id} className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-medium text-neutral-900">{casa.endereco}</h2>
              <p className="text-sm text-neutral-500">
                {casa.bairro.nome} — {TAMANHO_LABEL[casa.tamanhoTerreno]}
                {casa.temPiscina ? " · com piscina" : ""}
              </p>
            </div>
            {casa.assinaturas.length === 0 ? (
              <Link
                href={`/morador/planos/${casa.id}`}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Escolher plano
              </Link>
            ) : (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Plano {casa.assinaturas[0].plano.nome} ativo
              </span>
            )}
          </div>

          {casa.chamados.length > 0 && (
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <p className="mb-2 text-xs font-medium uppercase text-neutral-400">
                Últimos chamados
              </p>
              <ul className="space-y-1">
                {casa.chamados.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/morador/chamados/${c.id}`}
                      className="text-neutral-700 hover:text-emerald-700"
                    >
                      {c.categoria} — {c.descricao.slice(0, 40)}
                    </Link>
                    <span className="text-xs text-neutral-500">
                      {STATUS_CHAMADO_LABEL[c.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ativarBairro } from "@/actions/admin";
import { CriarBairroForm } from "@/components/forms/CriarBairroForm";

export default async function AdminBairrosPage() {
  const session = await auth();
  if (session?.user.tipo !== "ADMIN") redirect("/login");

  const bairros = await prisma.bairro.findMany({
    include: { _count: { select: { casas: true, prestadores: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Bairros</h1>

      <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-neutral-900">Cadastrar / ativar bairro</h2>
        <CriarBairroForm />
      </div>

      <div className="space-y-3">
        {bairros.map((bairro) => (
          <div
            key={bairro.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-neutral-900">
                {bairro.nome} — {bairro.cidade}/{bairro.estado}
              </p>
              <p className="text-sm text-neutral-500">
                {bairro._count.casas} casa(s) · {bairro._count.prestadores} prestador(es)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  bairro.status === "ATIVO"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {bairro.status === "ATIVO" ? "Ativo" : "Lista de espera"}
              </span>
              {bairro.status === "LISTA_ESPERA" && (
                <form action={ativarBairro.bind(null, bairro.id)}>
                  <button className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800">
                    Ativar
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

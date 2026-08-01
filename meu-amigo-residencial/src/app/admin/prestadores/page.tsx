import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aprovarPrestador, reprovarPrestador } from "@/actions/admin";
import { CATEGORIAS_LABEL } from "@/lib/enums";

export default async function AdminPrestadoresPage() {
  const session = await auth();
  if (session?.user.tipo !== "ADMIN") redirect("/login");

  const prestadores = await prisma.prestador.findMany({
    include: { usuario: true, documentos: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Prestadores</h1>
      <div className="space-y-3">
        {prestadores.map((prestador) => (
          <div key={prestador.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-neutral-900">
                  {prestador.usuario.nome} · {prestador.tipoPessoa}
                </p>
                <p className="text-sm text-neutral-500">{prestador.usuario.email}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {prestador.categorias.map((c) => CATEGORIAS_LABEL[c]).join(", ")}
                </p>
                <p className="text-xs text-neutral-400">
                  {prestador.documentos.length} documento(s) enviado(s)
                </p>
              </div>
              <div className="text-right">
                <span className="mb-2 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                  {prestador.statusAprovacao}
                </span>
                {prestador.statusAprovacao === "PENDENTE" && (
                  <div className="flex gap-2">
                    <form action={aprovarPrestador.bind(null, prestador.id)}>
                      <button className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800">
                        Aprovar
                      </button>
                    </form>
                    <form action={reprovarPrestador.bind(null, prestador.id)}>
                      <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
                        Reprovar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

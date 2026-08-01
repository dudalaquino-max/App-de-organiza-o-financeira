import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CriarPlanoForm } from "@/components/forms/CriarPlanoForm";

export default async function AdminPlanosPage() {
  const session = await auth();
  if (session?.user.tipo !== "ADMIN") redirect("/login");

  const [planos, bairros] = await Promise.all([
    prisma.planoAssinatura.findMany({ include: { bairro: true }, orderBy: { criadoEm: "desc" } }),
    prisma.bairro.findMany({ where: { status: "ATIVO" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 text-xl font-semibold">Planos de assinatura</h1>
        <div className="space-y-3">
          {planos.map((plano) => (
            <div key={plano.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="font-medium text-neutral-900">
                {plano.nome} — {plano.bairro?.nome ?? "Padrão global"}
              </p>
              <p className="text-sm text-neutral-500">
                P: R$ {plano.precoBaseP.toFixed(2)} · M: R$ {plano.precoBaseM.toFixed(2)} · G: R${" "}
                {plano.precoBaseG.toFixed(2)} · +piscina: R$ {plano.adicionalPiscina.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-neutral-900">Novo plano</h2>
        <CriarPlanoForm bairros={bairros} />
      </div>
    </div>
  );
}

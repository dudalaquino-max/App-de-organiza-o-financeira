import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcularPrecoPlano } from "@/lib/precos";
import { EscolherPlanoForm } from "@/components/forms/EscolherPlanoForm";

export default async function EscolherPlanoPage({
  params,
}: {
  params: Promise<{ casaId: string }>;
}) {
  const { casaId } = await params;
  const casa = await prisma.casa.findUnique({ where: { id: casaId } });
  if (!casa) notFound();

  const planos = await prisma.planoAssinatura.findMany({
    where: { ativo: true, OR: [{ bairroId: casa.bairroId }, { bairroId: null }] },
  });

  const opcoes = planos.map((plano) => ({
    id: plano.id,
    nome: plano.nome,
    descricao: plano.descricao,
    preco: calcularPrecoPlano(plano, casa.tamanhoTerreno, casa.temPiscina).toFixed(2),
  }));

  if (opcoes.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-600">
        Ainda não há planos configurados para o seu bairro. Nossa equipe entrará em contato em
        breve.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Escolha seu plano</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Preço calculado pelo perfil da casa cadastrada em {casa.endereco}.
      </p>
      <EscolherPlanoForm casaId={casa.id} planos={opcoes} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user.tipo !== "ADMIN") redirect("/login");

  const [bairrosAtivos, prestadoresAtivos, prestadoresPendentes, chamadosAbertos, pagamentos] =
    await Promise.all([
      prisma.bairro.count({ where: { status: "ATIVO" } }),
      prisma.prestador.count({ where: { statusAprovacao: "APROVADO" } }),
      prisma.prestador.count({ where: { statusAprovacao: "PENDENTE" } }),
      prisma.chamado.count({ where: { status: { notIn: ["CONCLUIDO", "CANCELADO"] } } }),
      prisma.pagamento.findMany({ where: { status: "PAGO" } }),
    ]);

  const gmv = pagamentos.reduce((acc, p) => acc + Number(p.valorBruto), 0);
  const taxaArrecadada = pagamentos.reduce((acc, p) => acc + Number(p.taxaPlataforma), 0);

  const cards = [
    { label: "Bairros ativos", valor: bairrosAtivos },
    { label: "Prestadores ativos", valor: prestadoresAtivos },
    { label: "Prestadores pendentes", valor: prestadoresPendentes },
    { label: "Chamados em andamento", valor: chamadosAbertos },
    { label: "GMV pago", valor: `R$ ${gmv.toFixed(2)}` },
    { label: "Taxa arrecadada (3%)", valor: `R$ ${taxaArrecadada.toFixed(2)}` },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">{card.valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

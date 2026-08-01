import { DashboardNav } from "@/components/DashboardNav";

const LINKS = [
  { href: "/prestador", label: "Início" },
  { href: "/prestador/chamados", label: "Chamados disponíveis" },
  { href: "/prestador/orcamentos", label: "Meus orçamentos" },
  { href: "/prestador/extrato", label: "Extrato" },
];

export default function PrestadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <DashboardNav brand="Meu Amigo Residencial" links={LINKS} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

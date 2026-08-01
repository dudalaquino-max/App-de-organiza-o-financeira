import { DashboardNav } from "@/components/DashboardNav";

const LINKS = [
  { href: "/morador", label: "Início" },
  { href: "/morador/chamados", label: "Meus chamados" },
  { href: "/morador/chamados/novo", label: "Abrir chamado" },
  { href: "/morador/casa/nova", label: "Adicionar casa" },
];

export default function MoradorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <DashboardNav brand="Meu Amigo Residencial" links={LINKS} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

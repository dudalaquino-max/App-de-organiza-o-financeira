import { DashboardNav } from "@/components/DashboardNav";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/prestadores", label: "Prestadores" },
  { href: "/admin/bairros", label: "Bairros" },
  { href: "/admin/planos", label: "Planos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <DashboardNav brand="Admin" links={LINKS} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

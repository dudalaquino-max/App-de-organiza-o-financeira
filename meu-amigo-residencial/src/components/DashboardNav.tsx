"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/actions/auth-signout";

export function DashboardNav({
  brand,
  links,
}: {
  brand: string;
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-4 py-4 font-semibold">{brand}</div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-emerald-50 font-medium text-emerald-800"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction} className="border-t border-neutral-200 p-3">
        <button type="submit" className="w-full text-left text-sm text-neutral-500 hover:text-neutral-800">
          Sair
        </button>
      </form>
    </aside>
  );
}

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold text-neutral-900">
          Meu Amigo Residencial
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/cadastro/prestador" className="text-neutral-600 hover:text-neutral-900">
            Sou prestador
          </Link>
          <Link href="/login" className="text-neutral-600 hover:text-neutral-900">
            Entrar
          </Link>
          <Link
            href="/cadastro/morador"
            className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Cadastrar minha casa
          </Link>
        </nav>
      </div>
    </header>
  );
}

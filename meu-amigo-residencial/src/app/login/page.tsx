import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Entrar</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Acesse sua conta do Meu Amigo Residencial.
        </p>
        <LoginForm />
        <div className="mt-6 space-y-1 text-center text-sm text-neutral-500">
          <p>
            Não tem conta?{" "}
            <Link href="/cadastro/morador" className="text-emerald-700 hover:underline">
              Cadastre sua casa
            </Link>
          </p>
          <p>
            É prestador de serviço?{" "}
            <Link href="/cadastro/prestador" className="text-emerald-700 hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

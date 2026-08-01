import { CadastroMoradorForm } from "@/components/forms/CadastroMoradorForm";

export default function CadastroMoradorPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Cadastre sua casa</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Depois de criar sua conta, você cadastra o endereço e escolhe o plano.
        </p>
        <CadastroMoradorForm />
      </div>
    </main>
  );
}

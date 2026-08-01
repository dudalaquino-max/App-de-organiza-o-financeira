import { CadastroCasaForm } from "@/components/forms/CadastroCasaForm";

export default function NovaCasaPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-semibold">Cadastre sua casa</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Usamos essas informações para calcular o preço do plano recorrente.
      </p>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <CadastroCasaForm />
      </div>
    </div>
  );
}

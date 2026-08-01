import { CadastroPrestadorForm } from "@/components/forms/CadastroPrestadorForm";

export default function CadastroPrestadorPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Cadastro de prestador</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Receba chamados recorrentes e eventuais de moradores do seu bairro.
        </p>
        <CadastroPrestadorForm />
      </div>
    </main>
  );
}

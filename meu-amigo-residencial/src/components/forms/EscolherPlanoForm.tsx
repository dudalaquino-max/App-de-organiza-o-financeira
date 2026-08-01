"use client";

import { useActionState, useState } from "react";
import { assinarPlano } from "@/actions/assinatura";

type PlanoOpcao = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: string;
};

export function EscolherPlanoForm({ casaId, planos }: { casaId: string; planos: PlanoOpcao[] }) {
  const [state, action, pending] = useActionState(assinarPlano, undefined);
  const [selecionado, setSelecionado] = useState(planos[0]?.id ?? "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="casaId" value={casaId} />

      <div className="grid gap-4 sm:grid-cols-3">
        {planos.map((plano) => (
          <label
            key={plano.id}
            className={`cursor-pointer rounded-2xl border p-5 ${
              selecionado === plano.id
                ? "border-emerald-600 ring-1 ring-emerald-600"
                : "border-neutral-200"
            }`}
          >
            <input
              type="radio"
              name="planoId"
              value={plano.id}
              checked={selecionado === plano.id}
              onChange={() => setSelecionado(plano.id)}
              className="sr-only"
            />
            <p className="font-medium text-neutral-900">{plano.nome}</p>
            <p className="mt-1 text-sm text-neutral-500">{plano.descricao}</p>
            <p className="mt-4 text-2xl font-semibold text-emerald-700">
              R$ {plano.preco}
              <span className="text-sm font-normal text-neutral-500">/mês</span>
            </p>
          </label>
        ))}
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Forma de pagamento
        </span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="formaPagamento" value="PIX" defaultChecked /> Pix recorrente
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="formaPagamento" value="CARTAO" /> Cartão de crédito
          </label>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !selecionado}
        className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Processando..." : "Assinar plano"}
      </button>
    </form>
  );
}

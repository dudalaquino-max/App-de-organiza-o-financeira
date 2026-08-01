"use client";

import { useActionState } from "react";
import { aprovarOrcamentoAction } from "@/actions/chamado";

export function AprovarOrcamentoForm({
  orcamentoId,
  chamadoId,
}: {
  orcamentoId: string;
  chamadoId: string;
}) {
  const [state, action, pending] = useActionState(aprovarOrcamentoAction, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="orcamentoId" value={orcamentoId} />
      <input type="hidden" name="chamadoId" value={chamadoId} />
      {state?.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Aprovando..." : "Aprovar orçamento"}
      </button>
    </form>
  );
}

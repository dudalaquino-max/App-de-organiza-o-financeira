"use client";

import { useActionState } from "react";
import { enviarOrcamento } from "@/actions/chamado";
import { Field, inputClass } from "@/components/ui/Field";

export function EnviarOrcamentoForm({ chamadoId }: { chamadoId: string }) {
  const [state, action, pending] = useActionState(enviarOrcamento, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="chamadoId" value={chamadoId} />
      <Field label="Valor (R$)">
        <input name="valor" type="number" step="0.01" min="0" required className={inputClass} />
      </Field>
      <Field label="Prazo de execução">
        <input name="prazoExecucao" required placeholder="ex: em até 5 dias úteis" className={inputClass} />
      </Field>
      <Field label="Observações (opcional)">
        <textarea name="observacoes" rows={3} className={inputClass} />
      </Field>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Enviar orçamento"}
      </button>
    </form>
  );
}

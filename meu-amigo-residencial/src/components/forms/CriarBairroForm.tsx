"use client";

import { useActionState } from "react";
import { criarBairro } from "@/actions/admin";
import { Field, inputClass } from "@/components/ui/Field";

export function CriarBairroForm() {
  const [state, action, pending] = useActionState(criarBairro, undefined);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-4 sm:items-end">
      <Field label="Bairro">
        <input name="nome" required className={inputClass} />
      </Field>
      <Field label="Cidade">
        <input name="cidade" required className={inputClass} />
      </Field>
      <Field label="UF">
        <input name="estado" required maxLength={2} className={inputClass} />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Ativar bairro"}
      </button>
      {state?.error && <p className="col-span-4 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

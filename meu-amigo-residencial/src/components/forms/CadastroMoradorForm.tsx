"use client";

import { useActionState } from "react";
import { cadastrarMorador } from "@/actions/auth";
import { Field, inputClass } from "@/components/ui/Field";

export function CadastroMoradorForm() {
  const [state, action, pending] = useActionState(cadastrarMorador, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field label="Nome completo">
        <input name="nome" required className={inputClass} />
      </Field>
      <Field label="E-mail">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Telefone">
        <input name="telefone" required placeholder="(11) 91234-5678" className={inputClass} />
      </Field>
      <Field label="CPF">
        <input name="cpf" required placeholder="Somente números" className={inputClass} />
      </Field>
      <Field label="Senha">
        <input name="senha" type="password" required minLength={6} className={inputClass} />
      </Field>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Criando conta..." : "Criar conta de morador"}
      </button>
    </form>
  );
}

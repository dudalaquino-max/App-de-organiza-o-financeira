"use client";

import { useActionState } from "react";
import { fazerLogin } from "@/actions/auth";
import { Field, inputClass } from "@/components/ui/Field";

export function LoginForm() {
  const [state, action, pending] = useActionState(fazerLogin, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field label="E-mail">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Senha">
        <input name="senha" type="password" required className={inputClass} />
      </Field>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

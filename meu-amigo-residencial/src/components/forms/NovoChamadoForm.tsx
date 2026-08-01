"use client";

import { useActionState } from "react";
import { criarChamado } from "@/actions/chamado";
import { Field, inputClass } from "@/components/ui/Field";
import { CATEGORIAS_EVENTUAIS, CATEGORIAS_LABEL } from "@/lib/enums";

export function NovoChamadoForm({ casas }: { casas: { id: string; endereco: string }[] }) {
  const [state, action, pending] = useActionState(criarChamado, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field label="Casa">
        <select name="casaId" required className={inputClass} defaultValue={casas[0]?.id}>
          {casas.map((casa) => (
            <option key={casa.id} value={casa.id}>
              {casa.endereco}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Categoria">
        <select name="categoria" required className={inputClass} defaultValue={CATEGORIAS_EVENTUAIS[0]}>
          {CATEGORIAS_EVENTUAIS.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORIAS_LABEL[cat]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Descrição do serviço">
        <textarea
          name="descricao"
          required
          minLength={10}
          rows={4}
          placeholder="Descreva o problema ou serviço desejado"
          className={inputClass}
        />
      </Field>

      <Field label="Fotos (links separados por vírgula, opcional)">
        <input name="fotos" className={inputClass} placeholder="https://..." />
      </Field>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Abrir chamado"}
      </button>
    </form>
  );
}

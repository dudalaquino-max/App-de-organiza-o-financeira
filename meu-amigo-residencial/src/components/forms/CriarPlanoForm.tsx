"use client";

import { useActionState } from "react";
import { criarPlano } from "@/actions/admin";
import { Field, inputClass } from "@/components/ui/Field";
import { CATEGORIAS_LABEL, CATEGORIAS_RECORRENTES } from "@/lib/enums";

export function CriarPlanoForm({ bairros }: { bairros: { id: string; nome: string }[] }) {
  const [state, action, pending] = useActionState(criarPlano, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field label="Bairro (deixe em branco para plano padrão global)">
        <select name="bairroId" className={inputClass} defaultValue="">
          <option value="">— Padrão global —</option>
          {bairros.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nome}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Nome do plano">
        <input name="nome" required placeholder="ex: Básico" className={inputClass} />
      </Field>

      <Field label="Descrição">
        <input name="descricao" className={inputClass} />
      </Field>

      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Serviços inclusos
        </span>
        <div className="flex flex-wrap gap-3">
          {CATEGORIAS_RECORRENTES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="servicosInclusos" value={cat} defaultChecked />
              {CATEGORIAS_LABEL[cat]}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Preço terreno P (R$)">
          <input name="precoBaseP" type="number" step="0.01" required className={inputClass} />
        </Field>
        <Field label="Preço terreno M (R$)">
          <input name="precoBaseM" type="number" step="0.01" required className={inputClass} />
        </Field>
        <Field label="Preço terreno G (R$)">
          <input name="precoBaseG" type="number" step="0.01" required className={inputClass} />
        </Field>
      </div>

      <Field label="Adicional por piscina (R$)">
        <input
          name="adicionalPiscina"
          type="number"
          step="0.01"
          defaultValue={0}
          required
          className={inputClass}
        />
      </Field>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Criar plano"}
      </button>
    </form>
  );
}

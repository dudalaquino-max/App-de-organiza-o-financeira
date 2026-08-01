"use client";

import { useActionState } from "react";
import { cadastrarCasa } from "@/actions/casa";
import { Field, inputClass } from "@/components/ui/Field";

export function CadastroCasaForm() {
  const [state, action, pending] = useActionState(cadastrarCasa, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Bairro">
          <input name="nomeBairro" required className={inputClass} />
        </Field>
        <Field label="Estado (UF)">
          <input name="estado" required maxLength={2} placeholder="SP" className={inputClass} />
        </Field>
      </div>
      <Field label="Cidade">
        <input name="cidade" required className={inputClass} />
      </Field>
      <Field label="Endereço completo">
        <input name="endereco" required className={inputClass} />
      </Field>
      <Field label="CEP">
        <input name="cep" required className={inputClass} />
      </Field>
      <Field label="Tamanho do terreno/quintal">
        <select name="tamanhoTerreno" required className={inputClass} defaultValue="PEQUENO">
          <option value="PEQUENO">Pequeno (até 250m²)</option>
          <option value="MEDIO">Médio (250–600m²)</option>
          <option value="GRANDE">Grande (acima de 600m²)</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="temPiscina" />
        Minha casa tem piscina
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar casa"}
      </button>
    </form>
  );
}

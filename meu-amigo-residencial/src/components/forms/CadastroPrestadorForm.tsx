"use client";

import { useActionState } from "react";
import { cadastrarPrestador } from "@/actions/auth";
import { Field, inputClass } from "@/components/ui/Field";
import { CATEGORIAS_LABEL } from "@/lib/enums";

export function CadastroPrestadorForm() {
  const [state, action, pending] = useActionState(cadastrarPrestador, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field label="Nome completo / Razão social">
        <input name="nome" required className={inputClass} />
      </Field>
      <Field label="E-mail">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Telefone">
        <input name="telefone" required placeholder="(11) 91234-5678" className={inputClass} />
      </Field>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="tipoPessoa" value="PF" defaultChecked /> Pessoa física
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="tipoPessoa" value="PJ" /> Pessoa jurídica
        </label>
      </div>

      <Field label="CPF ou CNPJ">
        <input name="cpfCnpj" required placeholder="Somente números" className={inputClass} />
      </Field>

      <Field label="Raio de atendimento (km)">
        <input
          name="raioAtendimentoKm"
          type="number"
          min={1}
          max={100}
          defaultValue={10}
          required
          className={inputClass}
        />
      </Field>

      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Categorias de serviço
        </span>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(CATEGORIAS_LABEL).map(([valor, label]) => (
            <label key={valor} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="categorias" value={valor} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <Field label="Senha">
        <input name="senha" type="password" required minLength={6} className={inputClass} />
      </Field>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Criando conta..." : "Criar conta de prestador"}
      </button>
      <p className="text-xs text-neutral-500">
        Após o cadastro, seus documentos serão avaliados pela nossa curadoria antes da liberação
        de chamados.
      </p>
    </form>
  );
}

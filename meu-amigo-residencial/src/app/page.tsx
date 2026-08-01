import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const SERVICOS_RECORRENTES = ["Corte de grama", "Limpeza de vidros", "Limpeza de calçada"];
const SERVICOS_EVENTUAIS = [
  "Pintura",
  "Reparo de rachadura",
  "Manutenção de pátio",
  "Manutenção de piscina",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
            A manutenção da sua casa, cuidada como bairro.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            Assinatura recorrente para os serviços do dia a dia e marketplace sob demanda para
            reparos maiores — tudo com prestadores curados e pagamento seguro em um único app.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/cadastro/morador"
              className="rounded-lg bg-emerald-700 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Cadastrar minha casa
            </Link>
            <Link
              href="/cadastro/prestador"
              className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              Quero ser prestador parceiro
            </Link>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Plano recorrente</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Mensalidade fixa, calculada pelo perfil da sua casa.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                {SERVICOS_RECORRENTES.map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Marketplace sob demanda</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Abra um chamado, receba orçamentos e aprove com um clique.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                {SERVICOS_EVENTUAIS.map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-lg font-semibold text-neutral-900">Como funciona</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              {
                titulo: "1. Cadastre sua casa",
                texto: "Endereço, bairro, tamanho do terreno e se tem piscina.",
              },
              {
                titulo: "2. Escolha ou contrate",
                texto: "Ative o plano recorrente ou abra um chamado avulso quando precisar.",
              },
              {
                titulo: "3. Pague com segurança",
                texto: "Pix ou cartão, com repasse automático ao prestador via split de pagamento.",
              },
            ].map((item) => (
              <div key={item.titulo}>
                <h3 className="font-medium text-neutral-900">{item.titulo}</h3>
                <p className="mt-1 text-sm text-neutral-600">{item.texto}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-8 text-center text-sm text-neutral-500">
        Meu Amigo Residencial — plataforma intermediária de manutenção residencial coletiva.
      </footer>
    </div>
  );
}

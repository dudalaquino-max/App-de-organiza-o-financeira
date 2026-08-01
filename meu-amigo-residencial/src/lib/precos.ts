import { PlanoAssinatura, TamanhoTerreno } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export function calcularPrecoPlano(
  plano: Pick<PlanoAssinatura, "precoBaseP" | "precoBaseM" | "precoBaseG" | "adicionalPiscina">,
  tamanhoTerreno: TamanhoTerreno,
  temPiscina: boolean
): Decimal {
  const base =
    tamanhoTerreno === "PEQUENO"
      ? plano.precoBaseP
      : tamanhoTerreno === "MEDIO"
        ? plano.precoBaseM
        : plano.precoBaseG;

  return temPiscina ? base.add(plano.adicionalPiscina) : base;
}

export function calcularTaxaPlataforma(valorBruto: Decimal): {
  taxa: Decimal;
  repasse: Decimal;
} {
  const percent = Number(process.env.PLATFORM_FEE_PERCENT ?? "0.03");
  const taxa = valorBruto.mul(percent).toDecimalPlaces(2);
  const repasse = valorBruto.sub(taxa);
  return { taxa, repasse };
}

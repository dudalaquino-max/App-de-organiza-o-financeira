export class AsaasConfigError extends Error {
  constructor() {
    super(
      "Gateway de pagamento não configurado. Defina ASAAS_API_KEY nas variáveis de ambiente."
    );
    this.name = "AsaasConfigError";
  }
}

function baseUrl() {
  return process.env.ASAAS_API_URL ?? "https://api-sandbox.asaas.com/v3";
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new AsaasConfigError();

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erro Asaas (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

export type AsaasCustomer = { id: string };

export async function criarClienteAsaas(input: {
  name: string;
  cpfCnpj: string;
  email: string;
  mobilePhone?: string;
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type AsaasSubaccount = { id: string; walletId: string; apiKey: string };

export async function criarSubcontaPrestador(input: {
  name: string;
  cpfCnpj: string;
  email: string;
  mobilePhone?: string;
}): Promise<AsaasSubaccount> {
  return asaasFetch<AsaasSubaccount>("/accounts", {
    method: "POST",
    body: JSON.stringify({ ...input, companyType: undefined }),
  });
}

type SplitInput = { walletId: string; percentualValue: number };

export type AsaasSubscription = { id: string; status: string };

export async function criarAssinaturaRecorrente(input: {
  customerId: string;
  valor: number;
  descricao: string;
  proximoVencimento: string; // YYYY-MM-DD
  formaPagamento: "PIX" | "CARTAO";
  walletIdPrestador?: string;
  percentualRepasse?: number;
}): Promise<AsaasSubscription> {
  const split: SplitInput[] | undefined = input.walletIdPrestador
    ? [
        {
          walletId: input.walletIdPrestador,
          percentualValue: input.percentualRepasse ?? 97,
        },
      ]
    : undefined;

  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.formaPagamento === "PIX" ? "PIX" : "CREDIT_CARD",
      value: input.valor,
      nextDueDate: input.proximoVencimento,
      cycle: "MONTHLY",
      description: input.descricao,
      split,
    }),
  });
}

export type AsaasPayment = { id: string; invoiceUrl: string; status: string };

export async function criarCobrancaAvulsa(input: {
  customerId: string;
  valor: number;
  descricao: string;
  vencimento: string; // YYYY-MM-DD
  formaPagamento: "PIX" | "CARTAO";
  walletIdPrestador?: string;
  percentualRepasse?: number;
}): Promise<AsaasPayment> {
  const split: SplitInput[] | undefined = input.walletIdPrestador
    ? [
        {
          walletId: input.walletIdPrestador,
          percentualValue: input.percentualRepasse ?? 97,
        },
      ]
    : undefined;

  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.formaPagamento === "PIX" ? "PIX" : "CREDIT_CARD",
      value: input.valor,
      dueDate: input.vencimento,
      description: input.descricao,
      split,
    }),
  });
}

/** Eventos relevantes do webhook do Asaas (payment.created/confirmed/received/etc). */
export type AsaasWebhookEvent = {
  event: string;
  payment: { id: string; status: string; value: number };
};

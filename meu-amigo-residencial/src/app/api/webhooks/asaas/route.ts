import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AsaasWebhookEvent } from "@/lib/asaas";

const EVENTOS_PAGO = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
const EVENTOS_ESTORNO = new Set(["PAYMENT_REFUNDED", "PAYMENT_CHARGEBACK_REQUESTED"]);

export async function POST(req: NextRequest) {
  const token = req.headers.get("asaas-access-token");
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const evento = (await req.json()) as AsaasWebhookEvent;
  const gatewayId = evento.payment?.id;
  if (!gatewayId) return NextResponse.json({ ok: true });

  if (EVENTOS_PAGO.has(evento.event)) {
    await prisma.pagamento.updateMany({
      where: { gatewayTransacaoId: gatewayId },
      data: { status: "PAGO", dataPagamento: new Date() },
    });
  } else if (EVENTOS_ESTORNO.has(evento.event)) {
    await prisma.pagamento.updateMany({
      where: { gatewayTransacaoId: gatewayId },
      data: { status: "ESTORNADO" },
    });
  }

  return NextResponse.json({ ok: true });
}

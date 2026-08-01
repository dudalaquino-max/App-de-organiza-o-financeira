export const CATEGORIAS_LABEL: Record<string, string> = {
  GRAMA: "Corte de grama",
  VIDROS: "Limpeza de vidros",
  CALCADA: "Limpeza de calçada",
  PINTURA: "Pintura",
  RACHADURA: "Reparo de rachadura",
  PATIO: "Manutenção de pátio",
  PISCINA: "Manutenção de piscina",
  OUTRO: "Outro",
};

export const CATEGORIAS_RECORRENTES = ["GRAMA", "VIDROS", "CALCADA"] as const;
export const CATEGORIAS_EVENTUAIS = ["PINTURA", "RACHADURA", "PATIO", "PISCINA", "OUTRO"] as const;

export const TAMANHO_LABEL: Record<string, string> = {
  PEQUENO: "Pequeno (até 250m²)",
  MEDIO: "Médio (250–600m²)",
  GRANDE: "Grande (acima de 600m²)",
};

export const STATUS_CHAMADO_LABEL: Record<string, string> = {
  ABERTO: "Aberto",
  ORCADO: "Orçado",
  APROVADO: "Aprovado",
  AGENDADO: "Agendado",
  EM_EXECUCAO: "Em execução",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  DISPUTA: "Em disputa",
};

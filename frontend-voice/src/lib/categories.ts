export const CATEGORY_LABELS: Record<string, string> = {
  GROCERIES: "Mercado",
  LEISURE: "Lazer",
  FOOD: "Alimentação",
  PHARMA: "Farmácia",
  HEALTH: "Saúde",
  AUTO: "Automóvel",
  TRANSPORT: "Transporte",
  HOUSING: "Moradia",
  EDUCATION: "Educação",
  SHOPPING: "Compras",
  SUBSCRIPTIONS: "Assinaturas",
  OTHER: "Outros",
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

export const CATEGORY_COLORS = [
  "#3987e5", // Mercado
  "#0d9488", // Lazer
  "#d95926", // Alimentação
  "#199e70", // Farmácia
  "#e66767", // Saúde
  "#9085e9", // Automóvel
  "#c98500", // Transporte
  "#d55181", // Moradia
  "#6366f1", // Educação
  "#ec4899", // Compras
  "#65a30d", // Assinaturas
  "#a1662f", // Outros
];

const FALLBACK_COLOR = "#52525b";

export function getCategoryColor(category: string) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? FALLBACK_COLOR : CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export function getCategoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category;
}

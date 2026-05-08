import type { ExistingEstimateRow } from "../../types/procurement";

export type EstimateColumnKey =
  | "rowNo"
  | "requestDate"
  | "requestVendor"
  | "dataTransfer"
  | "orderNo"
  | "revision"
  | "orderSubNo"
  | "inspectionNo"
  | "processName"
  | "drawingNo"
  | "itemName"
  | "dimensions"
  | "material"
  | "need"
  | "quantity"
  | "weight"
  | "price"
  | "dueDate"
  | "delivery";

export type EstimateColumn = {
  key: EstimateColumnKey;
  labelLines: string[];
  minWidth: number;
  resizable?: boolean;
  width: number;
};

export const estimateColumns: EstimateColumn[] = [
  { key: "rowNo", labelLines: [""], width: 32, minWidth: 28, resizable: false },
  { key: "requestDate", labelLines: ["見積依頼書", "作成日"], width: 76, minWidth: 60 },
  { key: "requestVendor", labelLines: ["見積依頼業者"], width: 92, minWidth: 70 },
  { key: "dataTransfer", labelLines: ["データ", "引継"], width: 38, minWidth: 30 },
  { key: "orderNo", labelLines: ["注文番号"], width: 76, minWidth: 58 },
  { key: "revision", labelLines: ["注文", "改善"], width: 38, minWidth: 30 },
  { key: "orderSubNo", labelLines: ["オーダ-No"], width: 68, minWidth: 52 },
  { key: "inspectionNo", labelLines: ["注文", "枝番"], width: 38, minWidth: 30 },
  { key: "processName", labelLines: ["工程名"], width: 78, minWidth: 56 },
  { key: "drawingNo", labelLines: ["符号"], width: 48, minWidth: 36 },
  { key: "itemName", labelLines: ["品名"], width: 126, minWidth: 82 },
  { key: "dimensions", labelLines: ["寸法"], width: 158, minWidth: 86 },
  { key: "material", labelLines: ["材質"], width: 104, minWidth: 74 },
  { key: "need", labelLines: ["必要", "否"], width: 36, minWidth: 30 },
  { key: "quantity", labelLines: ["数量"], width: 58, minWidth: 40 },
  { key: "weight", labelLines: ["重量"], width: 64, minWidth: 44 },
  { key: "price", labelLines: ["価格"], width: 92, minWidth: 68 },
  { key: "dueDate", labelLines: ["要求納期"], width: 78, minWidth: 64 },
  { key: "delivery", labelLines: ["納入"], width: 150, minWidth: 84 },
];

const materialBasePrices: Record<string, number> = {
  SUS304: 540,
  SUS316L: 720,
  SUS310S: 860,
};

const itemPriceFactors: Record<string, number> = {
  "ベアー伝熱管": 1.05,
  "フィン付伝熱管": 1.2,
  "曲げ加工費": 0.75,
  "水圧試験": 0.45,
  "SR費": 0.55,
};

const priceFormatter = new Intl.NumberFormat("ja-JP");

export function calculateEstimatePrice(row: ExistingEstimateRow): number | null {
  const materialKey = getSusMaterialKey(row.material);
  const quantity = parseQuantity(row.quantity);

  if (!materialKey || quantity <= 0) {
    return null;
  }

  const basePrice = materialBasePrices[materialKey];
  const itemFactor = itemPriceFactors[row.itemName] ?? 1;
  return Math.round(quantity * basePrice * itemFactor);
}

export function createInitialColumnWidths(): Record<EstimateColumnKey, number> {
  return estimateColumns.reduce(
    (widths, column) => ({ ...widths, [column.key]: column.width }),
    {} as Record<EstimateColumnKey, number>,
  );
}

export function formatEstimatePrice(price: number | null): string {
  return price === null ? "" : `${priceFormatter.format(price)}円`;
}

export function getUniqueOptions(
  rows: ExistingEstimateRow[],
  field: "processName" | "itemName" | "material",
  fallback: string[],
): string[] {
  return Array.from(new Set([...fallback, ...rows.map((row) => row[field])]))
    .filter(Boolean);
}

function getSusMaterialKey(material: string): string | null {
  const normalized = material.toUpperCase();

  if (normalized.includes("SUS316L")) {
    return "SUS316L";
  }

  if (normalized.includes("SUS310S")) {
    return "SUS310S";
  }

  if (normalized.includes("SUS")) {
    return "SUS304";
  }

  return null;
}

function parseQuantity(quantity: string): number {
  const parsed = Number(quantity.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

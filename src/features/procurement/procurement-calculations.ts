import type {
  ComparisonResult,
  FormState,
  PurchaseRecord,
  StainlessDailyPrice,
  StainlessTrendRow,
} from "../../types/procurement";

type SelectionResult = {
  score: number;
  matchedItems: string[];
};

export function getStainlessUnitPrice(
  price: StainlessDailyPrice,
  materialSpec: string,
): number {
  if (materialSpec === "SUS304") {
    return price.sus304UnitPrice;
  }

  if (materialSpec === "SUS316L") {
    return price.sus316lUnitPrice;
  }

  return 0;
}

export function calculateAverage(records: PurchaseRecord[]): number {
  if (records.length === 0) {
    return 0;
  }

  const total = records.reduce((sum, record) => sum + record.unitPrice, 0);
  return total / records.length;
}

export function calculateSelectionScore(
  record: PurchaseRecord,
  form: FormState,
): SelectionResult {
  const matchedItems: string[] = [];
  let score = 0;

  if (record.materialSpec === form.materialSpec) {
    score += 35;
    matchedItems.push("材質");
  }

  if (includesEitherSide(record.itemName, form.itemName)) {
    score += 25;
    matchedItems.push("品名");
  }

  score += calculateDimensionScore(record, form, matchedItems);
  score += calculateKeywordScore(record, form, matchedItems);

  if (record.vendorName === form.vendorName) {
    score += 10;
    matchedItems.push("業者");
  }

  const quantityScore = calculateQuantityScore(record.quantity, form.quantity);

  if (quantityScore >= 8) {
    matchedItems.push("数量");
  }

  score += quantityScore;

  return {
    score: Math.min(100, Math.round(score)),
    matchedItems: Array.from(new Set(matchedItems)),
  };
}

export function buildTrendRows(
  stainlessDailyPrices: StainlessDailyPrice[],
): StainlessTrendRow[] {
  return stainlessDailyPrices
    .map((price, index) => {
      const previous = stainlessDailyPrices[index - 1];

      return {
        ...price,
        sus304Change: previous
          ? price.sus304UnitPrice - previous.sus304UnitPrice
          : 0,
        sus316lChange: previous
          ? price.sus316lUnitPrice - previous.sus316lUnitPrice
          : 0,
      };
    })
    .reverse();
}

export function buildPriceMemo(
  result: Omit<ComparisonResult, "memo">,
  selectedRecordCount: number,
): string {
  if (selectedRecordCount === 0 || result.averagePastUnitPrice === 0) {
    return "近い過去実績が不足しています。品名、寸法、材質、その他キーワードを見直し、参照できる購買管理データを確認してください。";
  }

  const rate = result.difference / result.averagePastUnitPrice;

  if (rate >= 0.05) {
    return "SUS材の参考単価が実績表の平均単価を上回っています。ニッケル、クロム、モリブデン、為替の上昇要因と見積条件の差を確認してください。";
  }

  if (rate <= -0.05) {
    return "SUS材の参考単価が実績表の平均単価を下回っています。過去実績参照の条件差を確認し、価格交渉余地を整理してください。";
  }

  return "SUS材の参考単価と実績表の平均単価は近い水準です。品名、寸法、加工範囲、納期条件を確認してください。";
}

export function getTrendLabel(change: number): string {
  if (change > 0) {
    return "上昇";
  }

  if (change < 0) {
    return "低下";
  }

  return "横ばい";
}

export function getTrendClassName(change: number): string {
  if (change > 0) {
    return "trend-up";
  }

  if (change < 0) {
    return "trend-down";
  }

  return "trend-flat";
}

function calculateDimensionScore(
  record: PurchaseRecord,
  form: FormState,
  matchedItems: string[],
): number {
  if (normalizeText(record.dimensions) === normalizeText(form.dimensions)) {
    matchedItems.push("寸法");
    return 20;
  }

  const recordDimensionTokens = tokenize(record.dimensions);
  const formDimensionTokens = tokenize(form.dimensions);
  const hasDimensionTokenMatch = recordDimensionTokens.some((recordToken) =>
    formDimensionTokens.some((formToken) =>
      includesEitherSide(recordToken, formToken),
    ),
  );

  if (!hasDimensionTokenMatch) {
    return 0;
  }

  matchedItems.push("寸法近似");
  return 10;
}

function calculateKeywordScore(
  record: PurchaseRecord,
  form: FormState,
  matchedItems: string[],
): number {
  const searchTokens = tokenize(
    `${form.projectName} ${form.itemName} ${form.dimensions} ${form.extraKeywords}`,
  );
  const keywordMatches = record.keywords.filter((keyword) =>
    searchTokens.some((token) => includesEitherSide(keyword, token)),
  );

  if (keywordMatches.length === 0) {
    return 0;
  }

  matchedItems.push("その他");
  return Math.min(keywordMatches.length * 5, 15);
}

function calculateQuantityScore(recordQuantity: number, formQuantity: number): number {
  const baseQuantity = Math.max(formQuantity, 1);
  const quantityGapRatio = Math.abs(recordQuantity - formQuantity) / baseQuantity;
  return Math.max(0, 15 - quantityGapRatio * 15);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[　\s]+/g, " ");
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[,\s、，/／]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function includesEitherSide(first: string, second: string): boolean {
  const normalizedFirst = normalizeText(first);
  const normalizedSecond = normalizeText(second);

  return (
    normalizedFirst.length > 0 &&
    normalizedSecond.length > 0 &&
    (normalizedFirst.includes(normalizedSecond) ||
      normalizedSecond.includes(normalizedFirst))
  );
}

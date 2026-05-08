export type MaterialSpec = "SUS304" | "SUS316L";

export type QuantityUnit = "本" | "kg";

export type RawMaterialIndicator = {
  name: string;
  relatedMaterial?: string;
  latestValue: number;
  unit: string;
  previousChange: string;
  acquiredDate: string;
  sourceName: string;
  sourceUrl: string;
};

export type ExistingEstimateRow = {
  rowNo: number;
  orderNo: string;
  revision: number;
  orderSubNo: string;
  inspectionNo: number;
  processName: string;
  drawingNo: string;
  itemName: string;
  dimensions: string;
  material: string;
  need: string;
  quantity: string;
  dueDate: string;
  delivery: string;
};

export type PurchaseRecord = {
  orderNo: string;
  projectName: string;
  vendorName: string;
  itemName: string;
  dimensions: string;
  materialSpec: MaterialSpec;
  quantity: number;
  unitPrice: number;
  source: string;
  keywords: string[];
};

export type StainlessDailyPrice = {
  date: string;
  sus304UnitPrice: number;
  sus316lUnitPrice: number;
};

export type StainlessTrendRow = StainlessDailyPrice & {
  sus304Change: number;
  sus316lChange: number;
};

export type FormState = {
  requestNo: string;
  projectName: string;
  itemName: string;
  dimensions: string;
  materialSpec: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  vendorName: string;
  extraKeywords: string;
};

export type FormTextField =
  | "requestNo"
  | "projectName"
  | "itemName"
  | "dimensions"
  | "vendorName"
  | "extraKeywords";

export type SelectedPurchaseRecord = PurchaseRecord & {
  similarity: number;
  matchedItems: string[];
};

export type ComparisonResult = {
  averagePastUnitPrice: number;
  stainlessReferenceUnitPrice: number;
  difference: number;
  memo: string;
};

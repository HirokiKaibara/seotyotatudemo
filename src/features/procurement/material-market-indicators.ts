import { materialMarketIndicatorsByMaterial } from "../../../sample/material-market-indicators";
import type {
  ExistingEstimateRow,
  RawMaterialIndicator,
} from "../../types/procurement";

export function buildDisplayedMarketIndicators(
  rows: ExistingEstimateRow[],
  stainlessIndicators: RawMaterialIndicator[],
): RawMaterialIndicator[] {
  const materials = Array.from(new Set(rows.map((row) => row.material)))
    .filter(Boolean);
  const nonSusIndicators = materials.flatMap(
    (material) => materialMarketIndicatorsByMaterial[material] ?? [],
  );

  return [...stainlessIndicators, ...nonSusIndicators];
}

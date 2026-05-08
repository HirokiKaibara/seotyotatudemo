import { purchaseRecords } from "../../sample/purchase-records";
import {
  rawMaterialIndicators,
  stainlessDailyPrices,
} from "../../sample/stainless-market";
import { ProcurementDemo } from "../features/procurement/ProcurementDemo";

export default function Home() {
  return (
    <ProcurementDemo
      purchaseRecords={purchaseRecords}
      rawMaterialIndicators={rawMaterialIndicators}
      stainlessDailyPrices={stainlessDailyPrices}
    />
  );
}

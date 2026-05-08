import type {
  FormState,
  MaterialSpec,
  QuantityUnit,
} from "../../types/procurement";

export const materialSpecOptions: MaterialSpec[] = ["SUS304", "SUS316L"];
export const quantityUnitOptions: QuantityUnit[] = ["本", "kg"];

export const initialFormState: FormState = {
  requestNo: "RFQ-26001",
  projectName: "洗浄設備カバー材見積",
  itemName: "-",
  dimensions: "-",
  materialSpec: "SUS304",
  quantity: 520,
  quantityUnit: "本",
  vendorName: "北関東メタル",
  extraKeywords: "曲げ レーザー",
};

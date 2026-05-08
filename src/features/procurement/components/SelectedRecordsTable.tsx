import type { FormState, SelectedPurchaseRecord } from "../../../types/procurement";
import {
  formatCurrency,
  numberFormatter,
} from "../procurement-formatters";
import { EmptyState } from "./Shared";

type SelectedRecordsTableProps = {
  form: FormState;
  hasDisplayed: boolean;
  selectedRecords: SelectedPurchaseRecord[];
};

export function SelectedRecordsTable({
  form,
  hasDisplayed,
  selectedRecords,
}: SelectedRecordsTableProps) {
  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <h2>実績表</h2>
        <span>見積注番ごとに最大3件の引用実績を表示</span>
      </div>
      {hasDisplayed ? (
        <div className="table-wrap">
          <table className="wide-table">
            <thead>
              <tr>
                <th>見積注番</th>
                <th>引用注番</th>
                <th>品名</th>
                <th>寸法</th>
                <th>材質</th>
                <th>業者名</th>
                <th className="number-cell">数量</th>
                <th className="number-cell">実績単価</th>
                <th>一致項目</th>
                <th className="number-cell">スコア</th>
              </tr>
            </thead>
            <tbody>
              {selectedRecords.map((record) => (
                <tr key={record.orderNo}>
                  <td>{form.requestNo}</td>
                  <td>{record.orderNo}</td>
                  <td>{record.itemName}</td>
                  <td>{record.dimensions}</td>
                  <td>{record.materialSpec}</td>
                  <td>{record.vendorName}</td>
                  <td className="number-cell">
                    {numberFormatter.format(record.quantity)}
                  </td>
                  <td className="number-cell">
                    {formatCurrency(record.unitPrice)}
                  </td>
                  <td className="text-cell">
                    {record.matchedItems.length > 0
                      ? record.matchedItems.join(" / ")
                      : "-"}
                  </td>
                  <td className="number-cell">
                    <span className="score-badge">{record.similarity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState text="見積依頼書とは別に、今回の見積注番に紐づく実績表を表示します。" />
      )}
    </section>
  );
}

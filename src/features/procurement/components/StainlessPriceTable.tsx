import type { StainlessTrendRow } from "../../../types/procurement";
import {
  getTrendClassName,
  getTrendLabel,
} from "../procurement-calculations";
import {
  formatCurrency,
  formatSignedCurrency,
} from "../procurement-formatters";
import { EmptyState } from "./Shared";

type StainlessPriceTableProps = {
  hasDisplayed: boolean;
  trendRows: StainlessTrendRow[];
};

export function StainlessPriceTable({
  hasDisplayed,
  trendRows,
}: StainlessPriceTableProps) {
  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <h2>SUS材単価表</h2>
        <span>SUS304 / SUS316L 直近3日</span>
      </div>
      {hasDisplayed ? (
        <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>日付</th>
                <th className="number-cell">SUS304</th>
                <th className="number-cell">SUS304前日比</th>
                <th className="number-cell">SUS316L</th>
                <th className="number-cell">SUS316L前日比</th>
                <th>傾向</th>
              </tr>
            </thead>
            <tbody>
              {trendRows.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td className="number-cell">
                    {formatCurrency(row.sus304UnitPrice)}
                  </td>
                  <td className="number-cell">
                    <span className={getTrendClassName(row.sus304Change)}>
                      {formatSignedCurrency(row.sus304Change)}
                    </span>
                  </td>
                  <td className="number-cell">
                    {formatCurrency(row.sus316lUnitPrice)}
                  </td>
                  <td className="number-cell">
                    <span className={getTrendClassName(row.sus316lChange)}>
                      {formatSignedCurrency(row.sus316lChange)}
                    </span>
                  </td>
                  <td>
                    {getTrendLabel(row.sus304Change)} /{" "}
                    {getTrendLabel(row.sus316lChange)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState text="直近3日分のSUS材単価表を表示します。" />
      )}
    </section>
  );
}

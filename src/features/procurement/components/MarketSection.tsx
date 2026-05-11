import type { RawMaterialIndicator } from "../../../types/procurement";
import { formatIndicatorValue } from "../procurement-formatters";
import { EmptyState } from "./Shared";

type MarketSectionProps = {
  hasDisplayed: boolean;
  indicators: RawMaterialIndicator[];
  isOffline: boolean;
};

export function MarketSection({
  hasDisplayed,
  indicators,
  isOffline,
}: MarketSectionProps) {
  const showsRelatedMaterial = indicators.some(
    (indicator) => indicator.relatedMaterial,
  );

  return (
    <section className="panel market-panel">
      <div className="section-heading">
        <h2>原料・為替情報</h2>
        <span>相場情報表示</span>
      </div>
      {hasDisplayed ? (
        <div className="table-wrap market-scroll">
          <table className="compact-table market-table">
            <thead>
              <tr>
                <th className="market-item-cell">項目</th>
                {showsRelatedMaterial ? (
                  <th className="market-material-cell">対象材質</th>
                ) : null}
                <th className="number-cell market-value-cell">最新値</th>
                <th className="market-change-cell">前回比</th>
                <th className="market-date-cell">取得日</th>
                <th className="market-source-cell">参照元</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((indicator) => (
                <tr
                  key={`${indicator.relatedMaterial ?? "共通"}-${indicator.name}`}
                >
                  <td className="market-item-cell">{indicator.name}</td>
                  {showsRelatedMaterial ? (
                    <td className="market-material-cell">
                      {indicator.relatedMaterial ?? "-"}
                    </td>
                  ) : null}
                  <td className="number-cell market-value-cell">
                    {formatIndicatorValue(indicator.latestValue, indicator.unit)}
                  </td>
                  <td className="market-change-cell">
                    {indicator.previousChange}
                  </td>
                  <td className="market-date-cell">{indicator.acquiredDate}</td>
                  <td className="market-source-cell">
                    {isOffline ? (
                      <span className="source-label">
                        {indicator.sourceName}
                      </span>
                    ) : (
                      <a
                        href={indicator.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {indicator.sourceName}
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState text="反映すると、表の材質に応じた原料・為替情報を確認できます。" />
      )}
    </section>
  );
}

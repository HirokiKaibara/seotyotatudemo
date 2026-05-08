import type { RawMaterialIndicator } from "../../../types/procurement";
import { formatIndicatorValue } from "../procurement-formatters";
import { EmptyState } from "./Shared";

type MarketSectionProps = {
  hasDisplayed: boolean;
  indicators: RawMaterialIndicator[];
};

export function MarketSection({ hasDisplayed, indicators }: MarketSectionProps) {
  const showsRelatedMaterial = indicators.some(
    (indicator) => indicator.relatedMaterial,
  );

  return (
    <section className="panel market-panel">
      <div className="section-heading">
        <h2>原料・為替情報</h2>
        <span>ネット取得想定のモック表示</span>
      </div>
      {hasDisplayed ? (
        <div className="table-wrap market-scroll">
          <table className="compact-table market-table">
            <thead>
              <tr>
                <th>項目</th>
                {showsRelatedMaterial ? <th>対象材質</th> : null}
                <th className="number-cell">最新値</th>
                <th>前回比</th>
                <th>取得日</th>
                <th>参照元</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((indicator) => (
                <tr
                  key={`${indicator.relatedMaterial ?? "共通"}-${indicator.name}`}
                >
                  <td>{indicator.name}</td>
                  {showsRelatedMaterial ? (
                    <td>{indicator.relatedMaterial ?? "-"}</td>
                  ) : null}
                  <td className="number-cell">
                    {formatIndicatorValue(indicator.latestValue, indicator.unit)}
                  </td>
                  <td>{indicator.previousChange}</td>
                  <td>{indicator.acquiredDate}</td>
                  <td>
                    <a
                      href={indicator.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {indicator.sourceName}
                    </a>
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

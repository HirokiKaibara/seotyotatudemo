import type { ComparisonResult, FormState } from "../../../types/procurement";
import {
  formatCurrency,
  formatSignedCurrency,
} from "../procurement-formatters";
import { EmptyState, MetricCard } from "./Shared";

type ComparisonSectionProps = {
  comparisonResult: ComparisonResult;
  form: FormState;
  hasDisplayed: boolean;
  latestChange: number;
};

export function ComparisonSection({
  comparisonResult,
  form,
  hasDisplayed,
  latestChange,
}: ComparisonSectionProps) {
  return (
    <section className="panel comparison-panel">
      <div className="section-heading">
        <h2>比較結果</h2>
        <span>価格検討メモ</span>
      </div>
      {hasDisplayed ? (
        <div className="comparison-grid">
          <MetricCard
            label="実績表の平均単価"
            value={
              comparisonResult.averagePastUnitPrice > 0
                ? formatCurrency(comparisonResult.averagePastUnitPrice)
                : "-"
            }
          />
          <MetricCard
            label={`${form.materialSpec} 参考単価`}
            value={formatCurrency(comparisonResult.stainlessReferenceUnitPrice)}
          />
          <MetricCard
            label="前日比"
            value={formatSignedCurrency(latestChange)}
            tone={getMetricTone(latestChange)}
          />
          <MetricCard
            label="差額"
            value={
              comparisonResult.averagePastUnitPrice > 0
                ? formatSignedCurrency(comparisonResult.difference)
                : "-"
            }
            tone={getMetricTone(comparisonResult.difference)}
          />
          <div className="memo-box">
            <span>価格検討メモ</span>
            <p>{comparisonResult.memo}</p>
          </div>
        </div>
      ) : (
        <EmptyState text="実績表とSUS材単価表をもとにした比較結果をここに表示します。" />
      )}
    </section>
  );
}

function getMetricTone(value: number): "neutral" | "good" | "caution" {
  if (value > 0) {
    return "caution";
  }

  if (value < 0) {
    return "good";
  }

  return "neutral";
}

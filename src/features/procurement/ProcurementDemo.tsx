"use client";

import { useEffect, useMemo, useState } from "react";
import { existingEstimateRows } from "../../../sample/existing-estimate-rows";
import type {
  ComparisonResult,
  ExistingEstimateRow,
  PurchaseRecord,
  RawMaterialIndicator,
  SelectedPurchaseRecord,
  StainlessDailyPrice,
} from "../../types/procurement";
import { ComparisonSection } from "./components/ComparisonSection";
import { ExistingEstimateView } from "./components/ExistingEstimateView";
import { MarketSection } from "./components/MarketSection";
import { SelectedRecordsTable } from "./components/SelectedRecordsTable";
import { StainlessPriceTable } from "./components/StainlessPriceTable";
import { initialFormState } from "./procurement-constants";
import styles from "./ProcurementDemo.module.css";
import { buildDisplayedMarketIndicators } from "./material-market-indicators";
import {
  buildPriceMemo,
  buildTrendRows,
  calculateAverage,
  calculateSelectionScore,
  getStainlessUnitPrice,
} from "./procurement-calculations";

type ProcurementDemoProps = {
  purchaseRecords: PurchaseRecord[];
  rawMaterialIndicators: RawMaterialIndicator[];
  stainlessDailyPrices: StainlessDailyPrice[];
};

type MarketIndicatorsResponse = {
  indicators?: RawMaterialIndicator[];
};

export function ProcurementDemo({
  purchaseRecords,
  rawMaterialIndicators,
  stainlessDailyPrices,
}: ProcurementDemoProps) {
  const form = initialFormState;
  const [pageAcquiredDate] = useState(() => formatLocalDate(new Date()));
  const [hasDisplayed, setHasDisplayed] = useState(false);
  const [estimateRows, setEstimateRows] =
    useState<ExistingEstimateRow[]>(existingEstimateRows);
  const offlineState = useOfflineDemoMode();
  const isOffline = offlineState === true;
  const [marketIndicators, setMarketIndicators] = useState<RawMaterialIndicator[]>(
    rawMaterialIndicators,
  );
  const displayedStainlessPrices = useMemo(
    () => alignStainlessDatesToPreviousDays(stainlessDailyPrices, pageAcquiredDate),
    [pageAcquiredDate, stainlessDailyPrices],
  );

  useEffect(() => {
    if (offlineState === null) {
      return;
    }

    if (offlineState) {
      setMarketIndicators(rawMaterialIndicators);
      return;
    }

    const controller = new AbortController();

    async function loadMarketIndicators() {
      try {
        const response = await fetch("/api/market-indicators", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch market indicators.");
        }

        const payload = (await response.json()) as MarketIndicatorsResponse;

        if (Array.isArray(payload.indicators) && payload.indicators.length > 0) {
          setMarketIndicators(payload.indicators);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setMarketIndicators(rawMaterialIndicators);
        }
      }
    }

    loadMarketIndicators();

    return () => {
      controller.abort();
    };
  }, [offlineState, rawMaterialIndicators]);

  const latestStainlessPrice = getPriceByOffset(displayedStainlessPrices, 1);
  const previousStainlessPrice = getPriceByOffset(displayedStainlessPrices, 2);

  const trendRows = useMemo(
    () => buildTrendRows(displayedStainlessPrices).slice(0, 3),
    [displayedStainlessPrices],
  );
  const displayedMarketIndicators = useMemo(
    () =>
      applyAcquiredDate(
        buildDisplayedMarketIndicators(estimateRows, marketIndicators),
        pageAcquiredDate,
      ),
    [estimateRows, marketIndicators, pageAcquiredDate],
  );
  const selectedRecords = useMemo<SelectedPurchaseRecord[]>(
    () =>
      purchaseRecords
        .map((record) => {
          const selection = calculateSelectionScore(record, form);

          return {
            ...record,
            similarity: selection.score,
            matchedItems: selection.matchedItems,
          };
        })
        .filter((record) => record.similarity >= 30)
        .sort((first, second) => second.similarity - first.similarity)
        .slice(0, 3),
    [form, purchaseRecords],
  );

  const comparisonResult = useMemo<ComparisonResult>(() => {
    const averagePastUnitPrice = calculateAverage(selectedRecords);
    const stainlessReferenceUnitPrice = getStainlessUnitPrice(
      latestStainlessPrice,
      form.materialSpec,
    );
    const difference = stainlessReferenceUnitPrice - averagePastUnitPrice;
    const result = {
      averagePastUnitPrice,
      stainlessReferenceUnitPrice,
      difference,
    };

    return {
      ...result,
      memo: buildPriceMemo(result, selectedRecords.length),
    };
  }, [form.materialSpec, latestStainlessPrice, selectedRecords]);

  const latestChange =
    getStainlessUnitPrice(latestStainlessPrice, form.materialSpec) -
    getStainlessUnitPrice(previousStainlessPrice, form.materialSpec);
  const debugRows = [
    `状態: ${hasDisplayed ? "反映済み" : "反映前"}`,
    "上部表: sample/existing-estimate-rows.ts のモックデータを読込",
    "表示行: 18行を超える場合は表内スクロール",
    "編集項目: 工程名 / 品名 / 材質のセル変更を保持",
    "価格列: 反映後、材質にSUSを含む行のみモック計算",
    `相場データ: ${displayedMarketIndicators.length}件`,
    `表の材質: ${Array.from(new Set(estimateRows.map((row) => row.material))).join(" / ")}`,
    `SUS材単価表: ${trendRows.length}日分`,
    `過去購買実績: ${purchaseRecords.length}件`,
    `類似実績抽出結果: ${selectedRecords.length}件`,
    `下部表示: ${hasDisplayed ? "表示中" : "反映ボタン待ち"}`,
    `相場取得: ${isOffline ? "モックデータ" : "ネット取得 / 失敗時モック"}`,
  ];

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <h1>製品調達支援デモ</h1>
        </div>
        <div className="header-status">ローカルデモ</div>
      </header>

      <ExistingEstimateView
        isReflected={hasDisplayed}
        onRowsChange={setEstimateRows}
        rows={estimateRows}
      />

      <div className={styles.reflectRow}>
        <button type="button" onClick={() => setHasDisplayed(true)}>
          反映
        </button>
      </div>

      <section className={styles.debugPanel} aria-label="反映までのデバック情報">
        <div className={styles.debugTitle}>反映までのデバック情報</div>
        <div className={styles.debugScroll}>
          {debugRows.map((row, index) => (
            <p key={row}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {row}
            </p>
          ))}
        </div>
      </section>

      <p className={styles.windowNote}>下記表示内容は別ウィンドウ想定</p>

      <div className="content-grid" aria-live="polite">
        <MarketSection
          hasDisplayed={hasDisplayed}
          indicators={displayedMarketIndicators}
          isOffline={isOffline}
        />
        <ComparisonSection
          comparisonResult={comparisonResult}
          form={form}
          hasDisplayed={hasDisplayed}
          latestChange={latestChange}
        />
      </div>

      <StainlessPriceTable hasDisplayed={hasDisplayed} trendRows={trendRows} />
      <SelectedRecordsTable
        form={form}
        hasDisplayed={hasDisplayed}
        selectedRecords={selectedRecords}
      />
    </main>
  );
}

function useOfflineDemoMode(): boolean | null {
  const [isOffline, setIsOffline] = useState<boolean | null>(null);

  useEffect(() => {
    const updateNetworkState = () => {
      const forcedOffline =
        new URLSearchParams(window.location.search).get("offline") === "1";
      setIsOffline(forcedOffline || navigator.onLine === false);
    };

    updateNetworkState();
    window.addEventListener("online", updateNetworkState);
    window.addEventListener("offline", updateNetworkState);

    return () => {
      window.removeEventListener("online", updateNetworkState);
      window.removeEventListener("offline", updateNetworkState);
    };
  }, []);

  return isOffline;
}

function getPriceByOffset(
  prices: StainlessDailyPrice[],
  offsetFromEnd: number,
): StainlessDailyPrice {
  const fallback = {
    date: "-",
    sus304UnitPrice: 0,
    sus316lUnitPrice: 0,
  };
  return prices[prices.length - offsetFromEnd] ?? prices[0] ?? fallback;
}

function applyAcquiredDate(
  indicators: RawMaterialIndicator[],
  acquiredDate: string,
): RawMaterialIndicator[] {
  return indicators.map((indicator) => ({
    ...indicator,
    acquiredDate,
  }));
}

function alignStainlessDatesToPreviousDays(
  prices: StainlessDailyPrice[],
  baseDate: string,
): StainlessDailyPrice[] {
  const sourceRows = prices.slice(-3);

  if (sourceRows.length === 0) {
    return [];
  }

  return buildPreviousDates(baseDate, 3).map((date, index) => ({
    ...(sourceRows[index] ?? sourceRows.at(-1)!),
    date,
  }));
}

function buildPreviousDates(baseDate: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    addDays(baseDate, index - count),
  );
}

function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + days);
  return formatLocalDate(parsed);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

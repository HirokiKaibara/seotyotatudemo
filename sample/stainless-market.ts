import type {
  RawMaterialIndicator,
  StainlessDailyPrice,
} from "../src/types/procurement";

export const rawMaterialIndicators: RawMaterialIndicator[] = [
  {
    name: "ニッケル",
    latestValue: 2851000,
    unit: "円/t",
    previousChange: "+1.2%",
    acquiredDate: "2026-05-08",
    sourceName: "LME Official Prices",
    sourceUrl: "https://www.lme.com/market-data/reports-and-data/lme-official-prices",
  },
  {
    name: "クロム",
    latestValue: 1618000,
    unit: "円/t",
    previousChange: "+0.3%",
    acquiredDate: "2026-05-08",
    sourceName: "SMM Chromium Market",
    sourceUrl: "https://www.metal.com/Chromium/",
  },
  {
    name: "モリブデン",
    latestValue: 7150,
    unit: "円/kg",
    previousChange: "+0.7%",
    acquiredDate: "2026-05-08",
    sourceName: "LME Official Prices",
    sourceUrl: "https://www.lme.com/market-data/reports-and-data/lme-official-prices",
  },
  {
    name: "為替",
    latestValue: 154.8,
    unit: "円/USD",
    previousChange: "-0.2%",
    acquiredDate: "2026-05-08",
    sourceName: "日本銀行 外国為替市況",
    sourceUrl: "https://www.boj.or.jp/statistics/market/forex/fxdaily/index.htm/",
  },
];

export const stainlessDailyPrices: StainlessDailyPrice[] = [
  {
    date: "2026-05-02",
    sus304UnitPrice: 528,
    sus316lUnitPrice: 688,
  },
  {
    date: "2026-05-03",
    sus304UnitPrice: 531,
    sus316lUnitPrice: 692,
  },
  {
    date: "2026-05-04",
    sus304UnitPrice: 530,
    sus316lUnitPrice: 691,
  },
  {
    date: "2026-05-05",
    sus304UnitPrice: 533,
    sus316lUnitPrice: 696,
  },
  {
    date: "2026-05-06",
    sus304UnitPrice: 536,
    sus316lUnitPrice: 701,
  },
  {
    date: "2026-05-07",
    sus304UnitPrice: 538,
    sus316lUnitPrice: 703,
  },
  {
    date: "2026-05-08",
    sus304UnitPrice: 541,
    sus316lUnitPrice: 708,
  },
];

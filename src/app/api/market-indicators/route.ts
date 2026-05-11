import https from "node:https";
import { NextResponse } from "next/server";
import { rawMaterialIndicators } from "../../../../sample/stainless-market";
import type { RawMaterialIndicator } from "../../../types/procurement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/USD";
const DAILY_METAL_PRICE_TABLE_BASE = "https://www.dailymetalprice.com/prices.php";
const SCRAP_MONSTER_CHROMIUM_URL =
  "https://www.scrapmonster.com/metal-prices/minor-metals/chrome/672";
const KG_PER_POUND = 0.45359237;
const REQUEST_TIMEOUT_MS = 20000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) seotyotatudemo/0.1";

type CommodityKey = "nickel" | "chromium" | "molybdenum";

type ExchangeRateResponse = {
  rates?: {
    JPY?: number;
  };
  time_last_update_utc?: string;
};

type DailyMetalDefinition = {
  dailyMetalPriceCode?: string;
  displayScale: number;
  key: CommodityKey;
  name: string;
  origin?: string;
  rowName?: string;
  sourceName: string;
  sourceUrl: string;
  unit: string;
};

type CommodityObservation = {
  date: string;
  usdPerKg: number;
};

type LatestObservation = {
  date: string;
  previousUsdPerKg: number;
  usdPerKg: number;
};

const marketSeries: DailyMetalDefinition[] = [
  {
    dailyMetalPriceCode: "ni",
    displayScale: 1000,
    key: "nickel",
    name: "ニッケル",
    rowName: "Nickel",
    sourceName: "DailyMetalPrice",
    sourceUrl: "https://www.dailymetalprice.com/metalprices.php?c=ni&x=USD&u=lb",
    unit: "円/t",
  },
  {
    displayScale: 1000,
    key: "chromium",
    name: "クロム",
    origin: "EXW China",
    rowName: "Chromium Metal 99% min",
    sourceName: "ScrapMonster",
    sourceUrl: SCRAP_MONSTER_CHROMIUM_URL,
    unit: "円/t",
  },
  {
    dailyMetalPriceCode: "mo",
    displayScale: 1,
    key: "molybdenum",
    name: "モリブデン",
    rowName: "Molybdenum",
    sourceName: "DailyMetalPrice",
    sourceUrl: "https://www.dailymetalprice.com/metalprices.php?c=mo&x=USD&u=lb",
    unit: "円/kg",
  },
];

export async function GET() {
  const pageAcquiredDate = formatLocalDate(new Date());
  const fallbackByName = new Map(
    rawMaterialIndicators.map((indicator) => [indicator.name, indicator]),
  );
  const exchangeRate = await fetchUsdJpyRate();
  const observationsByCommodity = await fetchMarketObservations();
  const fetchedIndicators = marketSeries.map((series) => {
    const fallback = fallbackByName.get(series.name);

    try {
      if (!exchangeRate) {
        throw new Error("USD/JPY rate is unavailable.");
      }

      const observation = getLatestObservation(
        observationsByCommodity.get(series.key),
      );
      const latestValue =
        observation.usdPerKg * exchangeRate.rate * series.displayScale;
      const previousValue =
        observation.previousUsdPerKg * exchangeRate.rate * series.displayScale;

      return {
        acquiredDate: pageAcquiredDate,
        latestValue: Math.round(latestValue),
        name: series.name,
        previousChange: formatPercentChange(latestValue, previousValue),
        sourceName: series.sourceName,
        sourceUrl: series.sourceUrl,
        unit: series.unit,
      } satisfies RawMaterialIndicator;
    } catch {
      return fallback
        ? {
            ...fallback,
            acquiredDate: pageAcquiredDate,
          }
        : undefined;
    }
  });

  const exchangeFallback = fallbackByName.get("為替");
  const exchangeIndicator: RawMaterialIndicator | undefined = exchangeRate
    ? {
        acquiredDate: pageAcquiredDate,
        latestValue: roundTo(exchangeRate.rate, 2),
        name: "為替",
        previousChange: exchangeFallback?.previousChange ?? "-",
        sourceName: "ExchangeRate-API",
        sourceUrl: "https://www.exchangerate-api.com/",
        unit: "円/USD",
      }
    : exchangeFallback
      ? {
          ...exchangeFallback,
          acquiredDate: pageAcquiredDate,
        }
      : undefined;
  const indicators = [
    ...fetchedIndicators.filter(isIndicator),
    ...(exchangeIndicator ? [exchangeIndicator] : []),
  ];

  return NextResponse.json({
    indicators: mergeWithFallbackOrder(indicators),
  });
}

async function fetchMarketObservations(): Promise<
  Map<CommodityKey, CommodityObservation[]>
> {
  const entries = await Promise.all(
    marketSeries.map(async (series) => {
      try {
        const observations = series.dailyMetalPriceCode
          ? await fetchDailyMetalPriceObservations(
              series.dailyMetalPriceCode,
              series.rowName ?? series.name,
            )
          : await fetchScrapMonsterObservations(series);

        return [series.key, observations] as const;
      } catch {
        return [series.key, null] as const;
      }
    }),
  );

  return new Map(
    entries.filter(
      (
        entry,
      ): entry is readonly [CommodityKey, CommodityObservation[]] =>
        Array.isArray(entry[1]) && entry[1].length > 0,
    ),
  );
}

async function fetchUsdJpyRate(): Promise<{
  acquiredDate: string;
  rate: number;
} | null> {
  try {
    const payload = await fetchJsonViaHttps<ExchangeRateResponse>(
      EXCHANGE_RATE_API_URL,
    );
    const rate = payload.rates?.JPY;

    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      return null;
    }

    return {
      acquiredDate: formatAcquiredDate(payload.time_last_update_utc),
      rate,
    };
  } catch {
    return null;
  }
}

async function fetchDailyMetalPriceObservations(
  code: string,
  metalName: string,
): Promise<CommodityObservation[]> {
  const latestHtml = await fetchDailyMetalPriceTable(code);
  const latest = parseDailyMetalPriceRow(latestHtml, metalName);
  const targetDates = buildRecentDates(latest.date, 7);
  const fetchedRows = await Promise.all(
    targetDates.map(async (date) => {
      try {
        return parseDailyMetalPriceRow(
          await fetchDailyMetalPriceTable(code, date),
          metalName,
        );
      } catch {
        return null;
      }
    }),
  );
  const observationsByDate = new Map<string, CommodityObservation>();

  for (const row of [latest, ...fetchedRows]) {
    if (!row) {
      continue;
    }

    observationsByDate.set(row.date, row);
  }

  const observations = Array.from(observationsByDate.values()).sort(
    (first, second) => first.date.localeCompare(second.date),
  );

  if (observations.length < 2) {
    throw new Error(`DailyMetalPrice table has too few rows: ${metalName}`);
  }

  return observations;
}

async function fetchDailyMetalPriceTable(
  code: string,
  date?: string,
): Promise<string> {
  const url = new URL(DAILY_METAL_PRICE_TABLE_BASE);
  url.searchParams.set("c", code);
  url.searchParams.set("x", "USD");

  if (date) {
    url.searchParams.set("d", date);
  }

  return fetchTextViaHttps(url.toString());
}

function parseDailyMetalPriceRow(
  html: string,
  metalName: string,
): CommodityObservation {
  const rowMatch = html.match(
    new RegExp(
      `>${escapeRegExp(metalName)}<\\/a><\\/td>\\s*<td><a[^>]*>\\$([\\d,.]+)\\s*lb<\\/a><\\/td>\\s*<td><a[^>]*>(\\d{1,2}\\/\\d{1,2}\\/\\d{2})<\\/a>`,
    ),
  );

  if (!rowMatch) {
    throw new Error(`DailyMetalPrice row is missing: ${metalName}`);
  }

  return {
    date: formatDailyMetalPriceDate(rowMatch[2]),
    usdPerKg: parseNumber(rowMatch[1]) / KG_PER_POUND,
  };
}

async function fetchScrapMonsterObservations(
  series: DailyMetalDefinition,
): Promise<CommodityObservation[]> {
  if (!series.origin || !series.rowName) {
    throw new Error(`ScrapMonster source is not configured: ${series.name}`);
  }

  const html = await fetchTextViaHttps(series.sourceUrl);
  const rowName = escapeRegExp(series.rowName);
  const origin = escapeRegExp(series.origin);
  const rowMatch = html.match(
    new RegExp(
      `${rowName}<\\/a><\\/td><td[^>]*>${origin}<\\/td><td[^>]*>([\\d,.]+)<\\/td><td class="([^"]+)">([\\s\\S]*?)<\\/td><td[^>]*>([^<]+)<\\/td><td[^>]*>([^<]+)<\\/td>`,
    ),
  );

  if (!rowMatch) {
    throw new Error(`ScrapMonster row is missing: ${series.rowName}`);
  }

  const price = parseNumber(rowMatch[1]);
  const changeDirection = rowMatch[2];
  const absoluteChange = parseNumber(stripHtml(rowMatch[3]));
  const unit = rowMatch[4];
  const date = formatScrapMonsterDate(rowMatch[5]);
  const signedChange =
    changeDirection === "pricedown" && absoluteChange > 0
      ? -absoluteChange
      : absoluteChange;
  const previousPrice = price - signedChange;

  if (!Number.isFinite(price) || !Number.isFinite(previousPrice)) {
    throw new Error(`ScrapMonster price is invalid: ${series.rowName}`);
  }

  return [
    {
      date: addDays(date, -1),
      usdPerKg: convertScrapMonsterPriceToUsdPerKg(previousPrice, unit),
    },
    {
      date,
      usdPerKg: convertScrapMonsterPriceToUsdPerKg(price, unit),
    },
  ];
}

function getLatestObservation(
  observations: CommodityObservation[] | undefined,
): LatestObservation {
  if (!observations || observations.length < 2) {
    throw new Error("Commodity series is missing observations.");
  }

  const latest = observations.at(-1);
  const previous = observations.at(-2);

  if (!latest || !previous) {
    throw new Error("Commodity series is missing observations.");
  }

  return {
    date: latest.date,
    previousUsdPerKg: previous.usdPerKg,
    usdPerKg: latest.usdPerKg,
  };
}

function fetchJsonViaHttps<T>(input: string): Promise<T> {
  return fetchTextViaHttps(input).then((body) => JSON.parse(body) as T);
}

function fetchTextViaHttps(input: string): Promise<string> {
  const url = new URL(input);

  return new Promise((resolve, reject) => {
    const request = https.get(
      {
        family: 4,
        headers: {
          Accept: "application/json, text/html;q=0.9, */*;q=0.8",
          "User-Agent": USER_AGENT,
        },
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        protocol: url.protocol,
      },
      (response) => {
        let body = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (!response.statusCode || response.statusCode >= 400) {
            reject(new Error(`Failed to fetch ${input}`));
            return;
          }

          resolve(body);
        });
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error(`Request timed out: ${input}`));
    });
    request.on("error", reject);
  });
}

function formatPercentChange(current: number, previous: number): string {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return "-";
  }

  const percent = ((current - previous) / previous) * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${roundTo(percent, 1)}%`;
}

function formatAcquiredDate(value: string | undefined): string {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

function formatScrapMonsterDate(value: string): string {
  const match = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);

  if (!match) {
    throw new Error(`Invalid ScrapMonster date: ${value}`);
  }

  const monthIndex = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].indexOf(match[1].toLowerCase());

  if (monthIndex < 0) {
    throw new Error(`Invalid ScrapMonster date: ${value}`);
  }

  return formatUtcDate(
    new Date(Date.UTC(Number(match[3]), monthIndex, Number(match[2]))),
  );
}

function formatDailyMetalPriceDate(value: string): string {
  const [month, day, year] = value.split("/").map(Number);

  if (!month || !day || !year) {
    throw new Error(`Invalid DailyMetalPrice date: ${value}`);
  }

  return formatUtcDate(new Date(Date.UTC(2000 + year, month - 1, day)));
}

function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + days);
  return formatLocalDate(parsed);
}

function buildRecentDates(endDate: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => addDays(endDate, -index));
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}

function parseNumber(value: string): number {
  return Number(value.replace(/,/g, "").trim());
}

function convertScrapMonsterPriceToUsdPerKg(price: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase();

  if (normalizedUnit.includes("/kg")) {
    return price;
  }

  if (
    normalizedUnit.includes("/mt") ||
    normalizedUnit.includes("/ton") ||
    normalizedUnit.includes("/tonne")
  ) {
    return price / 1000;
  }

  if (normalizedUnit.includes("/lb")) {
    return price / KG_PER_POUND;
  }

  throw new Error(`Unsupported ScrapMonster unit: ${unit}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isIndicator(
  indicator: RawMaterialIndicator | undefined,
): indicator is RawMaterialIndicator {
  return Boolean(indicator);
}

function mergeWithFallbackOrder(
  fetchedIndicators: RawMaterialIndicator[],
): RawMaterialIndicator[] {
  const fetchedByName = new Map(
    fetchedIndicators.map((indicator) => [indicator.name, indicator]),
  );

  return rawMaterialIndicators.map(
    (fallbackIndicator) =>
      fetchedByName.get(fallbackIndicator.name) ?? fallbackIndicator,
  );
}

function roundTo(value: number, digits: number): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

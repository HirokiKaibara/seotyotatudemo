import type { RawMaterialIndicator } from "../src/types/procurement";

export const materialMarketIndicatorsByMaterial: Record<
  string,
  RawMaterialIndicator[]
> = {
  "STPT370-S": [
    createIndicator("鉄鉱石", "高温配管用炭素鋼鋼管", 18300, "円/t", "+0.5%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("原料炭", "高温配管用炭素鋼鋼管", 39000, "円/t", "-0.4%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("鉄スクラップ", "高温配管用炭素鋼鋼管", 51200, "円/t", "+0.6%", "鉄鋼新聞 市場価格ページ"),
  ],
  SA192M: [
    createIndicator("鉄鉱石", "ボイラ用継目無炭素鋼管", 18300, "円/t", "+0.5%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("原料炭", "ボイラ用継目無炭素鋼管", 39000, "円/t", "-0.4%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("フェロマンガン", "ボイラ用継目無炭素鋼管", 182000, "円/t", "+0.2%", "鉄鋼新聞 市場価格ページ"),
  ],
  "STB340-S-C": [
    createIndicator("鉄鉱石", "ボイラ・熱交換器用炭素鋼鋼管", 18300, "円/t", "+0.5%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("原料炭", "ボイラ・熱交換器用炭素鋼鋼管", 39000, "円/t", "-0.4%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("鉄スクラップ", "ボイラ・熱交換器用炭素鋼鋼管", 51200, "円/t", "+0.6%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("フェロシリコン", "ボイラ・熱交換器用炭素鋼鋼管", 236000, "円/t", "+0.1%", "鉄鋼新聞 市場価格ページ"),
  ],
  "火STB480-S-C": [
    createIndicator("鉄鉱石", "熱処理ボイラ・熱交換器用炭素鋼鋼管", 18300, "円/t", "+0.5%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("原料炭", "熱処理ボイラ・熱交換器用炭素鋼鋼管", 39000, "円/t", "-0.4%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("フェロマンガン", "熱処理ボイラ・熱交換器用炭素鋼鋼管", 182000, "円/t", "+0.2%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("フェロシリコン", "熱処理ボイラ・熱交換器用炭素鋼鋼管", 236000, "円/t", "+0.1%", "鉄鋼新聞 市場価格ページ"),
  ],
  "STBL380-S-C": [
    createIndicator("鉄鉱石", "低温配管用炭素鋼鋼管", 18300, "円/t", "+0.5%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("原料炭", "低温配管用炭素鋼鋼管", 39000, "円/t", "-0.4%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("フェロマンガン", "低温配管用炭素鋼鋼管", 182000, "円/t", "+0.2%", "鉄鋼新聞 市場価格ページ"),
    createIndicator("フェロシリコン", "低温配管用炭素鋼鋼管", 236000, "円/t", "+0.1%", "鉄鋼新聞 市場価格ページ"),
  ],
};

function createIndicator(
  name: string,
  relatedMaterial: string,
  latestValue: number,
  unit: string,
  previousChange: string,
  sourceName: string,
): RawMaterialIndicator {
  return {
    name,
    relatedMaterial,
    latestValue,
    unit,
    previousChange,
    acquiredDate: "2026-05-08",
    sourceName,
    sourceUrl: getSourceUrl(sourceName),
  };
}

function getSourceUrl(sourceName: string): string {
  if (sourceName.includes("日本銀行")) {
    return "https://www.boj.or.jp/statistics/market/forex/fxdaily/index.htm/";
  }

  if (sourceName.includes("経済産業省")) {
    return "https://www.meti.go.jp/statistics/tyo/seidou/";
  }

  return "https://www.japanmetaldaily.com/";
}

# 製品調達支援デモ 技術スタック

## 1. 採用方針

本デモは、ローカルで動作する一画面の業務用Webアプリとして実装する。

DB、認証、Firebase、RSS取得は使用せず、Next.jsとTypeScriptによるReactコンポーネントで構成する。ニッケル、クロム、モリブデン、為替レートはNext.js API Routeからネット取得し、取得できない場合はローカルのモックデータで再現する。SUS材単価表と比較結果の参考単価は、ローカルのサンプルデータで再現する。その他素材相場、既存見積明細、過去購買実績も、ローカルのサンプルデータで再現する。

製品版ではネット接続を前提にするが、デモ版ではネット未接続でも同梱データで画面確認できる構成とする。

## 2. 技術スタック

| 区分 | 採用技術 | 用途 |
| --- | --- | --- |
| フレームワーク | Next.js 16.2.5 | Webアプリ基盤、開発サーバー、本番ビルド |
| UIライブラリ | React 19.2.6 | 画面コンポーネント、状態管理 |
| 言語 | TypeScript 6.0.3 | 型定義、ロジック実装 |
| スタイリング | CSS / CSS Modules | 画面全体、現行見積表、テーブルUI |
| パッケージ管理 | npm | 依存関係管理、実行スクリプト |
| 外部データ取得 | Next.js API Route / Node.js HTTPS | ニッケル、クロム、モリブデン、為替レートの取得 |
| データ | TypeScriptサンプルデータ | 既存見積明細、過去購買実績、フォールバック用の原料・為替情報、SUS材参考単価 |

## 3. ディレクトリ構成

```text
seotyotatudemo/
  docs/
    tech-stack.md
  sample/
    existing-estimate-rows.ts
    material-market-indicators.ts
    purchase-records.ts
    stainless-market.ts
  src/
    app/
      api/
        market-indicators/
          route.ts
      globals.css
      layout.tsx
      page.tsx
    features/
      procurement/
        components/
          ComparisonSection.tsx
          ExistingEstimateView.tsx
          ExistingEstimateView.module.css
          MarketSection.tsx
          SelectedRecordsTable.tsx
          Shared.tsx
          StainlessPriceTable.tsx
        existing-estimate-table.ts
        material-market-indicators.ts
        ProcurementDemo.module.css
        ProcurementDemo.tsx
        procurement-calculations.ts
        procurement-constants.ts
        procurement-formatters.ts
    types/
      procurement.ts
  package.json
  package-lock.json
  tsconfig.json
  要件定義書.md
  製品調達支援デモ説明資料.md
```

## 4. 主要ファイル

### src/app/page.tsx

Next.js App Routerのページ入口を定義する。

- サンプルデータの読み込み
- 調達デモ画面コンポーネントの呼び出し

### src/app/api/market-indicators/route.ts

ニッケル、クロム、モリブデン、為替レートをネット取得するAPIを定義する。

- DailyMetalPriceからニッケル、モリブデンの日次価格を取得
- ScrapMonsterからクロムの公開価格を取得
- 公開為替APIからUSD/JPYを取得
- 金属価格を円換算して画面用データに整形
- 取得失敗時は `sample/stainless-market.ts` の原料・為替モックデータへフォールバック

### src/features/procurement/ProcurementDemo.tsx

一画面完結のメイン画面を構成する。

- 既存見積明細の状態管理
- 反映状態の管理
- オフライン表示状態の判定
- 主要相場のネット取得API呼び出し
- 原料・為替情報の組み立て
- 過去購買実績の抽出
- 実績平均単価とSUS材参考単価の比較
- 子コンポーネントへの表示データ受け渡し

### src/features/procurement/components/ExistingEstimateView.tsx

現行見積作成画面イメージを表示する。

- 見積依頼先、出力区分、国内外区分、依頼条件、検査区分の表示
- 既存見積明細表の表示
- 工程名、品名、材質のセル変更
- データ引継チェック
- 列幅調整

### src/features/procurement/components/MarketSection.tsx

原料・為替情報を表示する。

- ニッケル、クロム、モリブデン、為替の表示
- 見積明細の材質に応じた関連相場の表示
- 取得日は、取得元データの日付ではなく、画面で相場情報を取得・表示した日付として表示
- オンライン時の参照元リンク表示
- 未接続時の外部リンク抑止

### src/features/procurement/components/ComparisonSection.tsx

比較結果を表示する。

- 実績表の平均単価
- 同梱サンプルデータをもとにしたSUS材参考単価
- 前日比
- 差額
- 価格検討メモ

### src/features/procurement/components/StainlessPriceTable.tsx

SUS材単価表を表示する。

- SUS304、SUS316Lの直近3日分
- 単価は同梱サンプルデータを使用し、日付は表示日の前日から3日分に差し替えて表示
- 前日比
- 傾向

### src/features/procurement/components/SelectedRecordsTable.tsx

過去購買実績の抽出結果を表示する。

- 引用注番
- 品名、寸法、材質、業者名
- 数量、実績単価
- 一致項目、スコア

### src/features/procurement/procurement-calculations.ts

画面で利用する計算処理を定義する。

- SUS材単価の取得
- SUS材参考単価の前期間比計算
- 過去購買実績の簡易スコア計算
- 実績平均単価の計算
- 価格検討メモの作成

### src/features/procurement/material-market-indicators.ts

見積明細に含まれる材質に応じて、表示する相場情報を組み立てる。

### src/features/procurement/existing-estimate-table.ts

現行見積表の列定義と、反映後の価格欄に表示する簡易計算を定義する。

### sample/*.ts

デモ用サンプルデータを定義する。

| ファイル | 内容 |
| --- | --- |
| `sample/existing-estimate-rows.ts` | 現行見積明細データ |
| `sample/purchase-records.ts` | 過去購買管理データ |
| `sample/stainless-market.ts` | ニッケル、クロム、モリブデン、為替のフォールバック用モックデータ、SUS材参考単価のフォールバックデータ |
| `sample/material-market-indicators.ts` | 材質別の関連相場データ |

### src/types/procurement.ts

調達デモで利用する共通型を定義する。

- 既存見積明細
- 過去購買管理データ
- 原料・為替情報
- SUS材参考単価
- 抽出済み購買実績
- 比較結果

## 5. 実行コマンド

### 初回セットアップ

```powershell
cd <プロジェクトルート>
npm install
```

### 開発サーバー起動

```powershell
npm run dev
```

起動後、以下のURLをブラウザで開く。

```text
http://localhost:3000/
```

### 型チェック

```powershell
npm run typecheck
```

### 本番ビルド確認

```powershell
npm run build
```

### ビルド済みアプリ起動

```powershell
npm run start
```

## 6. package.json scripts

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Next.jsの開発サーバーを起動 |
| `npm run build` | 本番ビルドを実行 |
| `npm run start` | ビルド済みアプリを起動 |
| `npm run typecheck` | TypeScriptの型チェックを実行 |

## 7. オフライン確認

事前に `npm run build` を実行しておけば、ネット未接続でも `npm run start` でローカル起動できる。

通常確認:

```text
http://localhost:3000/
```

未接続時の表示確認を強制する場合:

```text
http://localhost:3000/?offline=1
```

## 8. 外部連携方針

現時点では、ニッケル、クロム、モリブデン、為替レートのみ外部データ取得を行う。RSS取得は行わない。

ニッケル、モリブデンはDailyMetalPrice、クロムはScrapMonster、為替レートは公開為替APIから取得する。ネット不通や取得失敗時は、ローカルのモックデータを表示する。本番化時は、利用許可、安定性、契約条件を確認したうえで、APIまたは契約データへの切り替えを検討する。

将来的に外部連携を広げる場合は、以下を前提にする。

- 利用許可済みの取得元のみ対象にする。
- API、CSV、契約データなど、安定して利用できる方式を優先する。
- 取得処理と画面表示処理を分離する。
- 原料価格、為替、必要に応じてSUS材単価表の更新処理を定期実行できるようにする。
- 取得エラー時の表示方法を業務担当者に分かる形で整理する。

## 9. 現在の制約

- 永続化は行わない。
- 認証、権限管理は行わない。
- その他素材は外部サイトからデータ取得しない。
- PDFの中身は解析しない。
- AI連携は行わない。
- SUS材単価表と比較結果の参考単価は、`sample/stainless-market.ts` のサンプルデータを使用し、ネット取得値は反映しない。
- 過去購買実績の抽出はデモ用の簡易スコアであり、正式な価格判断ではない。

# 製品調達支援デモ 技術スタック

## 1. 採用方針

本デモは、ローカルで動作する最小構成の業務用Webアプリとして実装する。

DB、認証、Firebase、外部API、スクレイピングは使用せず、Next.jsとTypeScriptによる単一画面のReactコンポーネントで構成する。

将来的なAI連携やネット取得を想定するが、現時点ではローカルのサンプルデータと簡易スコアで画面イメージを作成する。

## 2. 技術スタック

| 区分 | 採用技術 | 用途 |
| --- | --- | --- |
| フレームワーク | Next.js 16.2.5 | Webアプリ基盤、開発サーバー、本番ビルド |
| UIライブラリ | React 19.2.6 | 画面コンポーネント、状態管理 |
| 言語 | TypeScript 6.0.3 | 型定義、ロジック実装 |
| スタイリング | CSS | 業務システム風の画面レイアウト、テーブルUI |
| パッケージ管理 | npm | 依存関係管理、実行スクリプト |
| データ | TypeScriptサンプルデータ | 過去購買管理データ、原料・為替データ、SUS材日次単価 |

## 3. ディレクトリ構成

```text
seotyotatudemo/
  docs/
    requirements.md
    tech-stack.md
  sample/
    purchase-records.ts
    stainless-market.ts
  src/
    app/
      globals.css
      layout.tsx
      page.tsx
    features/
      procurement/
        components/
        ProcurementDemo.tsx
        procurement-calculations.ts
        procurement-constants.ts
        procurement-formatters.ts
    types/
      procurement.ts
  package.json
  package-lock.json
  tsconfig.json
```

## 4. 主要ファイル

### src/app/page.tsx

Next.js App Routerのページ入口を定義する。

主な内容は以下。

- サンプルデータの読み込み
- 調達デモ画面コンポーネントの呼び出し

### src/features/procurement/ProcurementDemo.tsx

一画面完結のメイン画面を構成する。

主な内容は以下。

- 見積内容入力フォーム
- 現行見積作成画面イメージ表示
- 原料・為替情報表示
- SUS304/SUS316Lの直近3日分の単価表表示
- 見積注番ごとの別紙実績表表示
- 実績表の平均単価とSUS材参考単価の比較
- 子コンポーネントへの表示データ受け渡し

### src/features/procurement/components/

調達デモ画面の各表示エリアを分割して定義する。

主な内容は以下。

- 見積内容入力
- 現行見積作成画面イメージ
- 原料・為替情報
- 比較結果
- SUS材単価表
- 実績表

### src/features/procurement/procurement-calculations.ts

画面で利用する計算処理を定義する。

主な内容は以下。

- 品名、寸法、材質、その他キーワードによる実績表の自動選別
- SUS材日次単価の前日比計算
- 実績表の平均単価計算
- 価格検討メモ生成

### sample/purchase-records.ts

過去購買管理データのサンプルを定義する。

主な内容は以下。

- 注番
- 案件名
- 業者名
- 品名
- 寸法
- 材質
- 数量
- 実績単価
- キーワード

### sample/stainless-market.ts

SUS材単価表作成に利用するサンプルデータを定義する。

主な内容は以下。

- ニッケル価格
- クロム価格
- モリブデン価格
- 為替
- SUS304日次単価
- SUS316L日次単価

### src/types/procurement.ts

調達デモで利用する共通型を定義する。

主な内容は以下。

- 材質
- 過去購買管理データ
- 原料・為替情報
- SUS材日次単価
- 入力フォーム
- 自動選別結果
- 比較結果

### src/app/globals.css

画面全体のスタイルを実装する。

主な内容は以下。

- 業務システム風の配色
- 入力フォームレイアウト
- パネル表示
- テーブルUI
- レスポンシブ対応

### src/app/layout.tsx

Next.js App Routerの共通レイアウトを定義する。

主な内容は以下。

- HTML言語設定
- メタデータ設定
- グローバルCSS読み込み

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
http://localhost:3000
```

### 型チェック

```powershell
npm run typecheck
```

### 本番ビルド確認

```powershell
npm run build
```

## 6. package.json scripts

| コマンド | 内容 |
| --- | --- |
| npm run dev | Next.jsの開発サーバーを起動 |
| npm run build | 本番ビルドを実行 |
| npm run start | ビルド済みアプリを起動 |
| npm run typecheck | TypeScriptの型チェックを実行 |

## 7. データ管理

現在はローカルのTypeScriptファイルにサンプルデータを定義している。

サンプルデータの種類は以下。

- 過去購買管理データ: `sample/purchase-records.ts`
- 原料・為替データ: `sample/stainless-market.ts`
- SUS材日次単価データ: `sample/stainless-market.ts`

サンプルデータはルート直下の `sample` に配置し、画面やロジックは `src` 配下に配置する。デモ用データと実装コードの責務を分けるため、この構成を採用している。

将来的には以下の形式へ差し替え可能。

- ローカルJSON
- CSV
- 許可済みAPI
- RSS
- 管理済みURLからの取得処理
- 基幹システムや購買管理システムからの取得処理

## 8. 外部連携方針

現時点では外部APIやスクレイピングは行わない。

参照元URLは画面に表示するが、取得結果はサンプルデータを使用する。

将来的に外部連携を行う場合は、以下を前提にする。

- 利用許可済みURLのみ対象にする。
- API、RSS、CSVなど公式または契約済みの取得手段を優先する。
- 取得処理と画面表示処理を分離する。
- 原料価格、為替、SUS材単価表の更新処理を日次バッチ化できるようにする。
- 取得エラー時は画面上で業務担当者に分かる文言を表示する。

## 9. AI連携方針

現時点ではAI連携は行わない。

デモでは、品名、寸法、材質、数量、業者名、その他キーワードの一致度を使った簡易スコアで実績表を自動選別する。

将来的にAI連携を行う場合は、以下を前提にする。

- 図面PDFをDBに保存し、蓄積済み図面情報を参照できるようにする。
- 必要に応じて、図面PDF内容、見積内容、過去購買管理データをAI連携の入力情報として扱う。
- 蓄積済み図面データから類似加工事例のオーダを選別する。
- 見積依頼書や別紙実績表の出力は、本ページでは扱わず別機能として検討する。
- 選別理由を業務担当者が確認できるようにする。
- 価格を断定せず、確認用の参考情報として表示する。
- 既存の簡易スコア処理と差し替えられるようにする。

## 10. ファイル分割方針

各自作ファイルは原則400行以内に保つ。

画面本体は `src/features/procurement/ProcurementDemo.tsx` に置き、入力、原料・為替、比較結果、SUS材単価表、実績表をコンポーネント単位に分割する。

## 11. 依存関係の補足

`postcss` はNext.jsの依存関係として利用される。監査結果に対応するため、`package.json` の `overrides` で `postcss` を `8.5.10` に固定している。

## 12. 現在の制約

- 永続化は行わない。
- 認証、権限管理は行わない。
- PDFの中身は解析しない。
- PDFをDBへ保存しない。
- 外部サイトからデータ取得しない。
- AI連携は行わない。
- SUS材単価表はサンプルデータから直近3日分を表示する。
- 自動選別は業務デモ用の簡易スコアであり、正式な価格判断ではない。

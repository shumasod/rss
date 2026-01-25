# API設定ガイド

このアプリケーションは複数のAPIサービスをサポートしています。このガイドでは、各APIの設定方法を説明します。

## 📚 レシピ検索API

### オプション1: TheMealDB（デフォルト - APIキー不要）

**特徴:**
- ✅ 完全無料
- ✅ APIキー不要
- ✅ 豊富な国際レシピ（特に英語圏）
- 🌐 公式サイト: https://www.themealdb.com/api.php

**設定:**
```bash
# .envファイルで設定（デフォルト）
VITE_RECIPE_SERVICE=mealdb
```

**使い方:**
そのまま使用できます。追加設定は不要です。

---

### オプション2: 楽天レシピAPI（日本語レシピ）

**特徴:**
- 📱 日本語の豊富なレシピ
- 🆓 無料プラン: 月間10,000リクエスト
- 🌐 公式サイト: https://webservice.rakuten.co.jp/

**セットアップ手順:**

1. **楽天デベロッパーアカウント作成**
   - https://webservice.rakuten.co.jp/ にアクセス
   - 「アプリID発行」をクリック
   - 新規アプリケーションを登録

2. **アプリIDを取得**
   - アプリ一覧から作成したアプリのIDをコピー

3. **環境変数を設定**
   ```bash
   # .envファイルを作成（.env.exampleをコピー）
   cp .env.example .env

   # .envファイルを編集
   VITE_RAKUTEN_APP_ID=あなたのアプリID
   VITE_RECIPE_SERVICE=rakuten
   ```

4. **開発サーバーを再起動**
   ```bash
   npm run dev
   ```

**注意事項:**
- APIキーが設定されていない場合は、デモデータが表示されます
- 無料プランの制限を超えた場合は、TheMealDBに切り替えてください

---

## 🚉 乗換検索API

### オプション1: モックデータ（デフォルト - APIキー不要）

**特徴:**
- ✅ APIキー不要
- ✅ 即座に使用可能
- ⚠️ デモ用の固定データ

**設定:**
```bash
# .envファイルで設定（デフォルト）
VITE_TRANSIT_SERVICE=mock
```

---

### オプション2: Google Maps Directions API（推奨）

**特徴:**
- 🌍 世界中の公共交通機関に対応
- 🆓 無料枠: 月間$200相当（約40,000リクエスト）
- 🎯 正確なルート情報
- 🌐 公式サイト: https://developers.google.com/maps/documentation/directions

**セットアップ手順:**

1. **Google Cloud Platform プロジェクト作成**
   - https://console.cloud.google.com/ にアクセス
   - 新しいプロジェクトを作成

2. **Directions API を有効化**
   - 「APIとサービス」→「ライブラリ」
   - 「Directions API」を検索して有効化

3. **APIキーを作成**
   - 「認証情報」→「認証情報を作成」→「APIキー」
   - 作成されたAPIキーをコピー

4. **APIキーを制限（推奨）**
   - HTTPリファラーを設定
   - Directions APIのみに制限

5. **環境変数を設定**
   ```bash
   # .envファイルを編集
   VITE_GOOGLE_MAPS_API_KEY=あなたのAPIキー
   VITE_TRANSIT_SERVICE=google
   ```

6. **開発サーバーを再起動**
   ```bash
   npm run dev
   ```

**料金について:**
- 月間$200の無料クレジット（約40,000リクエスト）
- 無料枠を超えた場合のみ課金
- 詳細: https://cloud.google.com/maps-platform/pricing

**注意事項:**
- APIキーが設定されていない場合は、モックデータが表示されます
- 本番環境では必ずAPIキーを制限してください

---

## 🔧 環境変数の設定方法

### ステップ1: .envファイルを作成

```bash
# プロジェクトルートで実行
cp .env.example .env
```

### ステップ2: .envファイルを編集

```bash
# レシピAPI設定
VITE_RAKUTEN_APP_ID=your_rakuten_app_id_here
VITE_RECIPE_SERVICE=mealdb  # または rakuten

# 乗換検索API設定
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_TRANSIT_SERVICE=mock  # または google

# デバッグモード（オプション）
VITE_DEBUG_MODE=false
```

### ステップ3: サーバーを再起動

```bash
npm run dev
```

---

## 🎯 推奨設定

### 開発環境（無料）

```bash
VITE_RECIPE_SERVICE=mealdb
VITE_TRANSIT_SERVICE=mock
```

### 本番環境（API制限あり）

```bash
VITE_RECIPE_SERVICE=rakuten  # または mealdb
VITE_RAKUTEN_APP_ID=your_app_id
VITE_TRANSIT_SERVICE=google
VITE_GOOGLE_MAPS_API_KEY=your_api_key
```

---

## ❓ トラブルシューティング

### APIキーが認識されない

**症状:** デモデータが表示され続ける

**解決方法:**
1. `.env`ファイルがプロジェクトルートに存在するか確認
2. 環境変数名が正しいか確認（`VITE_`プレフィックスが必要）
3. 開発サーバーを再起動
4. ブラウザのコンソールでエラーを確認（F12キー）

### Google Maps APIエラー

**症状:** "REQUEST_DENIED" エラー

**解決方法:**
1. APIキーが正しく設定されているか確認
2. Directions APIが有効化されているか確認
3. APIキーの制限設定を確認
4. 課金が有効になっているか確認（無料枠でもクレジットカード登録が必要）

### 楽天APIエラー

**症状:** レシピが取得できない

**解決方法:**
1. アプリIDが正しいか確認
2. API利用制限を超えていないか確認（月間10,000リクエスト）
3. ブラウザのコンソールでエラーメッセージを確認

---

## 📞 サポート

問題が解決しない場合:

1. **ブラウザコンソールを確認** (F12キー → Consoleタブ)
2. **GitHub Issuesで報告** https://github.com/shumasod/rss/issues
3. **ドキュメントを確認**
   - TheMealDB: https://www.themealdb.com/api.php
   - 楽天API: https://webservice.rakuten.co.jp/documentation/
   - Google Maps: https://developers.google.com/maps/documentation

---

## 🔐 セキュリティ

**重要:**
- `.env`ファイルは絶対にGitにコミットしないでください
- `.gitignore`に`.env`が含まれていることを確認
- 本番環境では環境変数を安全に管理してください
- APIキーは定期的にローテーションしてください

---

**更新日**: 2026-01-25

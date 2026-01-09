# 📰 RSSフィードリーダー

シンプルで使いやすいRSSフィードリーダーです。お気に入りのサイトの最新情報を一箇所でチェックできます。

## 🌟 特徴

- **シンプルなUI**: 直感的で使いやすいデザイン
- **複数フィード対応**: 複数のRSSフィードを一度に管理
- **リアルタイム更新**: 最新の記事を自動取得
- **フィルター機能**: 今日、今週、すべての記事を切り替え
- **プリセット対応**: 人気サイトのフィードを簡単に追加
- **レスポンシブデザイン**: スマートフォンにも対応
- **ローカルストレージ**: フィード設定をブラウザに保存

## 🚀 使い方

### 基本的な使い方

1. **フィードの追加**
   - 上部の入力欄にRSSフィードのURLを入力
   - 「フィード追加」ボタンをクリック
   - またはプリセットボタンから人気サイトを追加

2. **記事の閲覧**
   - 追加したフィードの記事が自動的に表示されます
   - 記事カードをクリックで元サイトへ移動

3. **フィルター**
   - 「すべて」: すべての記事を表示
   - 「今日」: 今日の記事のみ表示
   - 「今週」: 過去7日間の記事を表示

4. **フィードの削除**
   - 登録フィード一覧から「削除」ボタンをクリック

### プリセットフィード

以下のフィードがプリセットとして利用可能です：

- Yahoo!ニュース
- NHKニュース
- GIGAZINE

## 📁 ファイル構成

```
rss/
├── index.html      # メインHTMLファイル
├── style.css       # スタイルシート
├── script.js       # JavaScript（RSSフィード処理）
└── README.md       # このファイル
```

## 🔧 技術仕様

- **HTML5**: セマンティックマークアップ
- **CSS3**: モダンなスタイリング、グラデーション、アニメーション
- **JavaScript (ES6+)**: クラスベースの設計
- **RSS2JSON API**: CORS問題の回避のため使用
- **LocalStorage**: フィード設定の永続化

## 🌐 デプロイ方法

このプロジェクトは静的サイトなので、以下のサービスで簡単にデプロイできます：

### GitHub Pages

```bash
# リポジトリをクローン
git clone <repository-url>

# GitHub Pagesを有効化
# Settings > Pages > Source を main ブランチに設定
```

### Netlify

1. Netlifyにログイン
2. 「New site from Git」を選択
3. リポジトリを選択
4. デプロイ

### Vercel

```bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトディレクトリでデプロイ
vercel
```

### ローカルで実行

```bash
# シンプルなHTTPサーバーを起動
python -m http.server 8000
# または
npx serve .

# ブラウザで http://localhost:8000 を開く
```

## 📝 カスタマイズ

### プリセットフィードの追加

`index.html` の `.preset-buttons` セクションにボタンを追加：

```html
<button class="preset-btn" data-url="YOUR_RSS_URL">サイト名</button>
```

### カラーテーマの変更

`style.css` のグラデーション部分を編集：

```css
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

## 🐛 既知の問題

- 一部のRSSフィードはCORS制限により直接アクセスできないため、RSS2JSON APIを使用しています
- RSS2JSON APIには無料プランで制限があります（1時間に10,000リクエスト）

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

MIT License

## 🙏 謝辞

- RSS2JSON API for providing CORS-free RSS parsing
- デザインインスピレーション: Modern web design trends

---

**Enjoy your RSS reading! 📰✨**

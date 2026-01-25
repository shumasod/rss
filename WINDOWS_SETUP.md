# Windows 開発環境セットアップガイド

このドキュメントでは、Windows環境でRSSフィードリーダーアプリケーションを開発・実行する手順を説明します。

## 📋 前提条件

以下のソフトウェアがインストールされている必要があります：

### 1. Node.js (v18以上推奨)

**インストール方法：**

1. [Node.js公式サイト](https://nodejs.org/)にアクセス
2. **LTS版（推奨版）** をダウンロード
3. インストーラーを実行し、デフォルト設定でインストール
4. インストール確認：

```cmd
# コマンドプロンプトまたはPowerShellを開く
node --version
npm --version
```

**出力例：**
```
v20.11.0
10.2.4
```

### 2. Git for Windows

**インストール方法：**

1. [Git公式サイト](https://git-scm.com/download/win)からダウンロード
2. インストーラーを実行
3. インストール確認：

```cmd
git --version
```

**出力例：**
```
git version 2.43.0.windows.1
```

---

## 🚀 プロジェクトのセットアップ

### ステップ1: リポジトリをクローン

```cmd
# プロジェクトを配置したいディレクトリに移動
cd C:\Users\YourName\Projects

# リポジトリをクローン
git clone https://github.com/shumasod/rss.git

# プロジェクトディレクトリに移動
cd rss
```

### ステップ2: ブランチをチェックアウト（必要な場合）

```cmd
# レシピ機能ブランチに切り替え
git checkout claude/implement-meal-recipe-rd4mv
```

### ステップ3: 依存関係のインストール

```cmd
# npm パッケージをインストール
npm install
```

**実行結果：**
```
added 205 packages, and audited 206 packages in 15s

42 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

⚠️ **警告が表示される場合：**
- `npm WARN deprecated` は通常問題ありません
- セキュリティ脆弱性が検出された場合は `npm audit fix` で修正できます

---

## 🎯 開発サーバーの起動

### 方法1: コマンドプロンプト

```cmd
# プロジェクトディレクトリで実行
npm run dev
```

### 方法2: PowerShell

```powershell
# プロジェクトディレクトリで実行
npm run dev
```

### 方法3: Visual Studio Code統合ターミナル

1. VS Codeでプロジェクトフォルダを開く
2. `` Ctrl + ` `` でターミナルを開く
3. 以下のコマンドを実行：

```bash
npm run dev
```

---

## 📺 サーバー起動後の表示

開発サーバーが起動すると、以下のような出力が表示されます：

```
> rss-feed-reader@1.0.0 dev
> vite

  VITE v5.4.21  ready in 850 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

### アクセス方法

1. **ローカル開発：**
   - ブラウザで `http://localhost:5173/` を開く
   - または `Ctrl + クリック` でURLを直接開く

2. **同じネットワーク内の他デバイスからアクセス：**
   - スマホやタブレットから `http://192.168.1.100:5173/` を開く
   - （IPアドレスは表示されたものを使用）

3. **自動的にブラウザで開く：**
   - Windows 10/11では、URLをクリックするだけで既定のブラウザが開きます

---

## 🛠️ 開発時の便利なコマンド

### 1. 型チェック

```cmd
npm run type-check
```

### 2. ビルド（本番用）

```cmd
npm run build
```

**出力例：**
```
> rss-feed-reader@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
✓ 124 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-txxeRSxJ.css   16.47 kB │ gzip:  3.40 kB
dist/assets/index-DbSiW1oU.js   221.89 kB │ gzip: 68.61 kB
✓ built in 1.31s
```

### 3. ビルド後のプレビュー

```cmd
npm run preview
```

### 4. Lintチェック

```cmd
npm run lint
```

---

## 🌐 アプリケーションの使い方

### 起動後の画面

ブラウザでアプリを開くと、以下の機能が利用できます：

#### 1. **タイムライン表示** （デフォルト）
- Yahoo Newsスタイルのタイムライン
- 日付ごとにグループ化された記事

#### 2. **リスト表示**
- すべての記事を一覧表示
- フィルター機能（すべて/今日/今週）

#### 3. **🚉 乗換案内**
- 国内外の公共交通機関の乗換検索
- 出発地と目的地を入力して検索

#### 4. **🍽️ レシピ検索** （新機能）
- **レシピ検索タブ：**
  - レシピ名で検索（例：chicken, pasta）
  - カテゴリで検索（Beef, Chicken, Dessert等）

- **ランダムタブ：**
  - おすすめレシピを自動表示
  - リフレッシュで新しいレシピを取得

- **お気に入りタブ：**
  - お気に入り登録したレシピを表示
  - ブラウザのLocalStorageに保存

---

## 🔧 トラブルシューティング

### ポート5173が既に使用されている場合

```
Error: Port 5173 is already in use
```

**解決方法1: 別のポートを使用**

```cmd
# vite.config.tsを編集してポートを変更
# または環境変数で指定
set PORT=3000 && npm run dev
```

**解決方法2: 既存のプロセスを終了**

```cmd
# PowerShellで実行
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# または、タスクマネージャーで "Node.js" プロセスを終了
```

### npm installでエラーが発生する場合

```cmd
# キャッシュをクリア
npm cache clean --force

# node_modulesとpackage-lock.jsonを削除
rmdir /s /q node_modules
del package-lock.json

# 再インストール
npm install
```

### TypeScriptエラーが表示される場合

```cmd
# TypeScriptの型定義を再インストール
npm install --save-dev @types/react @types/react-dom
```

### ホットリロードが動作しない場合

**vite.config.ts に以下を追加：**

```typescript
export default defineConfig({
  server: {
    watch: {
      usePolling: true,  // Windowsでのファイル監視を有効化
    },
  },
});
```

---

## 🎨 開発環境の推奨設定

### Visual Studio Code 拡張機能

以下の拡張機能をインストールすると開発効率が向上します：

1. **ESLint** - コードの静的解析
2. **Prettier** - コードフォーマッター
3. **TypeScript Vue Plugin (Volar)** - TypeScript サポート
4. **Error Lens** - エラーの inline 表示
5. **Auto Rename Tag** - HTMLタグの自動リネーム
6. **Path Intellisense** - パス補完

### VS Code設定（.vscode/settings.json）

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## 🔒 セキュリティとデータ

### データの保存場所

- **お気に入りレシピ：** ブラウザの LocalStorage
- **RSSフィード設定：** ブラウザの LocalStorage

### データのバックアップ

ブラウザの開発者ツールで確認・エクスポート可能：

1. `F12` で開発者ツールを開く
2. `Application` タブ → `Local Storage` → `http://localhost:5173`
3. データをコピーしてバックアップ

### データの削除

```javascript
// ブラウザコンソールで実行
localStorage.clear()
```

---

## 📦 本番環境へのデプロイ

### ビルドファイルの生成

```cmd
npm run build
```

### 生成されるファイル

```
dist/
├── index.html
└── assets/
    ├── index-txxeRSxJ.css
    └── index-DbSiW1oU.js
```

### デプロイ先の例

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: リポジトリ設定から有効化
- **AWS S3 + CloudFront**: 静的ホスティング

---

## 📞 サポート

### 問題が解決しない場合

1. **GitHub Issues**: https://github.com/shumasod/rss/issues
2. **ログの確認**: `npm run dev` の出力をコピー
3. **ブラウザコンソール**: `F12` → `Console` タブでエラーを確認

### 開発ログの保存

```cmd
# ログをファイルに出力
npm run dev > dev.log 2>&1
```

---

## 🎉 次のステップ

1. **コードの理解**: `src/` ディレクトリ内のファイルを確認
2. **機能追加**: 新しいユースケースやコンポーネントを追加
3. **テストの作成**: Jest や Vitest でテストを書く
4. **デプロイ**: 本番環境にデプロイ

---

## 📚 参考リンク

- [Vite ドキュメント](https://vitejs.dev/)
- [React ドキュメント](https://react.dev/)
- [TypeScript ドキュメント](https://www.typescriptlang.org/)
- [TheMealDB API](https://www.themealdb.com/api.php)

---

**作成日**: 2026-01-25
**対応バージョン**: Node.js 18+, Windows 10/11

# 📰 RSS Feed Reader - DDD & Microservices Architecture

React + TypeScript + Domain-Driven Design（DDD）+ マイクロサービスアーキテクチャで構築されたモダンなRSSフィードリーダーです。

## 🏗️ アーキテクチャ

このプロジェクトは **ドメイン駆動設計（DDD）** と **クリーンアーキテクチャ** の原則に基づいて設計されており、保守性、拡張性、テスタビリティを重視しています。

### レイヤー構造

```
src/
├── domain/                 # ドメイン層（ビジネスロジック）
│   ├── entities/          # エンティティ（Feed, Article）
│   ├── value-objects/     # 値オブジェクト（FeedId, FeedUrl等）
│   ├── repositories/      # リポジトリインターフェース
│   └── services/          # ドメインサービスインターフェース
│
├── application/           # アプリケーション層（ユースケース）
│   └── use-cases/        # ビジネスユースケース
│       ├── AddFeedUseCase.ts
│       ├── RemoveFeedUseCase.ts
│       ├── GetArticlesUseCase.ts
│       └── RefreshAllFeedsUseCase.ts
│
├── infrastructure/        # インフラストラクチャ層（実装詳細）
│   ├── repositories/     # リポジトリ実装
│   │   ├── LocalStorageFeedRepository.ts
│   │   └── InMemoryArticleRepository.ts
│   └── services/        # 外部サービス実装
│       └── Rss2JsonFeedFetchService.ts
│
├── presentation/          # プレゼンテーション層（UI）
│   ├── components/       # Reactコンポーネント
│   ├── hooks/           # カスタムフック
│   └── App.tsx          # メインアプリケーション
│
└── di/                    # 依存性注入
    └── container.ts      # DIコンテナ設定
```

## 🎯 DDDの主要概念

### エンティティ (Entities)
- **Feed**: RSSフィードを表現。一意なID、URL、名前を持つ
- **Article**: 記事を表現。フィードから取得された個別の記事

### 値オブジェクト (Value Objects)
- **FeedId/ArticleId**: エンティティの一意識別子
- **FeedUrl/ArticleUrl**: URLのバリデーションを含む
- **FeedName/ArticleTitle**: 名前/タイトルのバリデーションを含む

### リポジトリ (Repositories)
- **IFeedRepository**: フィードの永続化を抽象化
- **IArticleRepository**: 記事の永続化を抽象化

### ユースケース (Use Cases)
各ユースケースは単一の責務を持ち、マイクロサービスとして独立して動作：

- **AddFeedUseCase**: フィード追加
- **RemoveFeedUseCase**: フィード削除
- **GetAllFeedsUseCase**: フィード一覧取得
- **GetArticlesUseCase**: 記事取得（フィルタリング付き）
- **RefreshAllFeedsUseCase**: 全フィード更新

## 🔧 マイクロサービス設計

各ユースケースは独立したマイクロサービスとして設計されており：

- **疎結合**: 依存性注入により各サービスは独立
- **単一責任**: 各サービスは1つの機能のみを担当
- **置き換え可能**: インターフェースを通じて実装を簡単に変更可能
- **テスト容易**: モックを使用した単体テストが容易

### 実装の切り替え例

```typescript
// LocalStorageからAPIベースのリポジトリへの切り替え
container.register<IFeedRepository>('IFeedRepository', {
  useClass: ApiFeedRepository, // LocalStorageFeedRepository から変更
});
```

## 🌟 主な特徴

- ✨ **型安全**: TypeScriptによる完全な型安全性
- 🏛️ **DDD**: ドメイン駆動設計による堅牢なビジネスロジック
- 🔄 **疎結合**: 依存性注入による柔軟なアーキテクチャ
- 📦 **マイクロサービス**: 独立したユースケース実装
- 🎨 **モダンUI**: Reactによる宣言的UI
- 💾 **永続化**: LocalStorage + インメモリストレージ
- 🧪 **テスタブル**: モックを使用した単体テストが容易
- 📱 **レスポンシブ**: モバイル対応デザイン

## 🚀 セットアップ

### 前提条件

- Node.js 18.x 以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# 型チェック
npm run type-check

# Lint
npm run lint
```

## 📖 使い方

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

## 🧪 テストの追加方法

```typescript
// Example: FeedエンティティのUnit Test
describe('Feed Entity', () => {
  it('should create a feed with valid URL', () => {
    const feed = Feed.create('https://example.com/rss');
    expect(feed).toBeDefined();
    expect(feed.url.value).toBe('https://example.com/rss');
  });

  it('should throw error for invalid URL', () => {
    expect(() => Feed.create('invalid-url')).toThrow();
  });
});
```

## 🔄 新機能の追加方法

### 1. ドメイン層に新しいエンティティを追加

```typescript
// src/domain/entities/NewEntity.ts
export class NewEntity {
  // エンティティの実装
}
```

### 2. ユースケースを作成

```typescript
// src/application/use-cases/NewUseCase.ts
@injectable()
export class NewUseCase {
  constructor(
    @inject('IRepository') private repository: IRepository,
  ) {}

  async execute(): Promise<Result> {
    // ユースケースの実装
  }
}
```

### 3. インフラストラクチャ層に実装を追加

```typescript
// src/infrastructure/repositories/NewRepository.ts
@injectable()
export class NewRepository implements IRepository {
  // リポジトリの実装
}
```

### 4. DIコンテナに登録

```typescript
// src/di/container.ts
container.register<IRepository>('IRepository', {
  useClass: NewRepository,
});
```

### 5. UIコンポーネントで使用

```typescript
// src/presentation/components/NewComponent.tsx
const useCase = container.resolve(NewUseCase);
const result = await useCase.execute();
```

## 🏢 本番環境への移行

### APIサーバーへの移行例

```typescript
// インフラ層で新しいリポジトリ実装を作成
@injectable()
export class ApiFeedRepository implements IFeedRepository {
  private apiUrl = 'https://api.example.com';

  async save(feed: Feed): Promise<void> {
    await fetch(`${this.apiUrl}/feeds`, {
      method: 'POST',
      body: JSON.stringify(feed.toJSON()),
    });
  }

  // その他のメソッド実装
}

// DIコンテナで切り替え
container.register<IFeedRepository>('IFeedRepository', {
  useClass: ApiFeedRepository, // LocalStorageからAPIへ
});
```

## 📚 技術スタック

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **DI Container**: TSyringe
- **State Management**: React Hooks
- **Styling**: CSS3 (CSS-in-JS不使用)
- **Storage**: LocalStorage + In-Memory
- **External API**: RSS2JSON

## 🎓 学習リソース

- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TSyringe Documentation](https://github.com/microsoft/tsyringe)

## 🤝 コントリビューション

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 ライセンス

MIT License

## 🙏 謝辞

- Eric Evans for Domain-Driven Design
- Robert C. Martin for Clean Architecture
- RSS2JSON API for CORS-free RSS parsing

---

**Built with ❤️ using DDD, Clean Architecture, and Microservices principles**

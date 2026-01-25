import 'reflect-metadata';
import { container } from 'tsyringe';

// Repositories
import { IFeedRepository } from '@domain/repositories/IFeedRepository';
import { IArticleRepository } from '@domain/repositories/IArticleRepository';
import { LocalStorageFeedRepository } from '@infrastructure/repositories/LocalStorageFeedRepository';
import { InMemoryArticleRepository } from '@infrastructure/repositories/InMemoryArticleRepository';

// Services
import { IFeedFetchService } from '@domain/services/IFeedFetchService';
import { Rss2JsonFeedFetchService } from '@infrastructure/services/Rss2JsonFeedFetchService';
import { ITransitSearchService } from '@domain/services/ITransitSearchService';
import { JapanTransitSearchService } from '@infrastructure/services/JapanTransitSearchService';
import { GoogleMapsTransitService } from '@infrastructure/services/GoogleMapsTransitService';
import { InternationalTransitSearchService } from '@infrastructure/services/InternationalTransitSearchService';
import { IMealRecipeService } from '@domain/services/IMealRecipeService';
import { MealDbRecipeService } from '@infrastructure/services/MealDbRecipeService';
import { RakutenRecipeService } from '@infrastructure/services/RakutenRecipeService';
import { IRecipeRepository } from '@domain/repositories/IRecipeRepository';
import { LocalStorageRecipeRepository } from '@infrastructure/repositories/LocalStorageRecipeRepository';

/**
 * DI Container Setup
 * 依存性注入コンテナの設定
 * マイクロサービス間の疎結合を実現
 * 環境変数に基づいてサービスを選択
 */
export const setupContainer = () => {
  console.log('🔧 Setting up DI container...');

  // Repository implementations
  container.register<IFeedRepository>('IFeedRepository', {
    useClass: LocalStorageFeedRepository,
  });

  container.register<IArticleRepository>('IArticleRepository', {
    useClass: InMemoryArticleRepository,
  });

  container.register<IRecipeRepository>('IRecipeRepository', {
    useClass: LocalStorageRecipeRepository,
  });

  // Service implementations
  container.register<IFeedFetchService>('IFeedFetchService', {
    useClass: Rss2JsonFeedFetchService,
  });

  // レシピサービスの選択
  const recipeService = import.meta.env.VITE_RECIPE_SERVICE || 'mealdb';
  console.log(`📚 Recipe service: ${recipeService}`);

  if (recipeService === 'rakuten') {
    container.register<IMealRecipeService>('IMealRecipeService', {
      useClass: RakutenRecipeService,
    });
  } else {
    // デフォルトはTheMealDB（APIキー不要）
    container.register<IMealRecipeService>('IMealRecipeService', {
      useClass: MealDbRecipeService,
    });
  }

  // 乗換検索サービスの選択
  const transitService = import.meta.env.VITE_TRANSIT_SERVICE || 'mock';
  console.log(`🚉 Transit service: ${transitService}`);

  if (transitService === 'google') {
    container.register<ITransitSearchService>('IJapanTransitSearchService', {
      useClass: GoogleMapsTransitService,
    });
  } else {
    // デフォルトはモックデータ（APIキー不要）
    container.register<ITransitSearchService>('IJapanTransitSearchService', {
      useClass: JapanTransitSearchService,
    });
  }

  container.register<ITransitSearchService>('IInternationalTransitSearchService', {
    useClass: InternationalTransitSearchService,
  });

  console.log('✅ DI container setup complete');

  return container;
};

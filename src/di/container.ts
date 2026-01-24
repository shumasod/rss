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
import { InternationalTransitSearchService } from '@infrastructure/services/InternationalTransitSearchService';
import { IMealRecipeService } from '@domain/services/IMealRecipeService';
import { MealDbRecipeService } from '@infrastructure/services/MealDbRecipeService';
import { IRecipeRepository } from '@domain/repositories/IRecipeRepository';
import { LocalStorageRecipeRepository } from '@infrastructure/repositories/LocalStorageRecipeRepository';

/**
 * DI Container Setup
 * 依存性注入コンテナの設定
 * マイクロサービス間の疎結合を実現
 */
export const setupContainer = () => {
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

  container.register<ITransitSearchService>('IJapanTransitSearchService', {
    useClass: JapanTransitSearchService,
  });

  container.register<ITransitSearchService>('IInternationalTransitSearchService', {
    useClass: InternationalTransitSearchService,
  });

  container.register<IMealRecipeService>('IMealRecipeService', {
    useClass: MealDbRecipeService,
  });

  return container;
};

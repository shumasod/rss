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

  return container;
};

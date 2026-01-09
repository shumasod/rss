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

  return container;
};

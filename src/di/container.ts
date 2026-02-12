import 'reflect-metadata';
import { container } from 'tsyringe';

// Repositories
import { IFeedRepository } from '@domain/repositories/IFeedRepository';
import { IArticleRepository } from '@domain/repositories/IArticleRepository';
import { LocalStorageFeedRepository } from '@infrastructure/repositories/LocalStorageFeedRepository';
import { InMemoryArticleRepository } from '@infrastructure/repositories/InMemoryArticleRepository';

// Services - Feed
import { IFeedFetchService } from '@domain/services/IFeedFetchService';
import { Rss2JsonFeedFetchService } from '@infrastructure/services/Rss2JsonFeedFetchService';

// Services - Transit
import { ITransitSearchService } from '@domain/services/ITransitSearchService';
import { JapanTransitSearchService } from '@infrastructure/services/JapanTransitSearchService';
import { GoogleMapsTransitService } from '@infrastructure/services/GoogleMapsTransitService';
import { OsrmTransitService } from '@infrastructure/services/OsrmTransitService';
import { NavitiaTransitService } from '@infrastructure/services/NavitiaTransitService';
import { InternationalTransitSearchService } from '@infrastructure/services/InternationalTransitSearchService';

// Services - Recipe
import { IMealRecipeService } from '@domain/services/IMealRecipeService';
import { MealDbRecipeService } from '@infrastructure/services/MealDbRecipeService';
import { RakutenRecipeService } from '@infrastructure/services/RakutenRecipeService';
import { SpoonacularRecipeService } from '@infrastructure/services/SpoonacularRecipeService';
import { EdamamRecipeService } from '@infrastructure/services/EdamamRecipeService';

// Repositories - Recipe
import { IRecipeRepository } from '@domain/repositories/IRecipeRepository';
import { LocalStorageRecipeRepository } from '@infrastructure/repositories/LocalStorageRecipeRepository';

/**
 * DI Container Setup
 * 依存性注入コンテナの設定
 *
 * 利用可能なサービス（環境変数で選択）:
 *
 * レシピ (VITE_RECIPE_SERVICE):
 *   - mealdb    : TheMealDB API（デフォルト、APIキー不要、英語レシピ）
 *   - rakuten   : 楽天レシピAPI（日本語レシピ、要アプリID）
 *   - spoonacular: Spoonacular API（多機能、要APIキー、150req/日）
 *   - edamam    : Edamam API（栄養情報充実、要app_id+app_key、10req/分）
 *
 * 乗換検索 (VITE_TRANSIT_SERVICE):
 *   - mock      : デモデータ（デフォルト、APIキー不要）
 *   - osrm      : OSRM（完全無料、APIキー不要、徒歩/自転車/車）
 *   - navitia   : Navitia API（公共交通機関、月90,000req、要トークン）
 *   - google    : Google Maps Directions API（要APIキー、月$200無料枠）
 */
export const setupContainer = () => {
  console.log('🔧 Setting up DI container...');

  // === Repositories ===
  container.register<IFeedRepository>('IFeedRepository', {
    useClass: LocalStorageFeedRepository,
  });
  container.register<IArticleRepository>('IArticleRepository', {
    useClass: InMemoryArticleRepository,
  });
  container.register<IRecipeRepository>('IRecipeRepository', {
    useClass: LocalStorageRecipeRepository,
  });

  // === Feed Service ===
  container.register<IFeedFetchService>('IFeedFetchService', {
    useClass: Rss2JsonFeedFetchService,
  });

  // === Recipe Service ===
  const recipeService = import.meta.env.VITE_RECIPE_SERVICE || 'mealdb';
  console.log(`📚 Recipe service: ${recipeService}`);

  const recipeServiceMap: Record<string, any> = {
    mealdb: MealDbRecipeService,
    rakuten: RakutenRecipeService,
    spoonacular: SpoonacularRecipeService,
    edamam: EdamamRecipeService,
  };

  container.register<IMealRecipeService>('IMealRecipeService', {
    useClass: recipeServiceMap[recipeService] ?? MealDbRecipeService,
  });

  // === Transit Service ===
  const transitService = import.meta.env.VITE_TRANSIT_SERVICE || 'osrm';
  console.log(`🚉 Transit service: ${transitService}`);

  const transitServiceMap: Record<string, any> = {
    mock: JapanTransitSearchService,
    osrm: OsrmTransitService,
    navitia: NavitiaTransitService,
    google: GoogleMapsTransitService,
  };

  container.register<ITransitSearchService>('IJapanTransitSearchService', {
    useClass: transitServiceMap[transitService] ?? OsrmTransitService,
  });

  container.register<ITransitSearchService>('IInternationalTransitSearchService', {
    useClass: InternationalTransitSearchService,
  });

  console.log('✅ DI container setup complete');

  return container;
};

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // レシピAPI
  readonly VITE_RECIPE_SERVICE?: 'mealdb' | 'rakuten' | 'spoonacular' | 'edamam';
  readonly VITE_RAKUTEN_APP_ID?: string;
  readonly VITE_SPOONACULAR_API_KEY?: string;
  readonly VITE_EDAMAM_APP_ID?: string;
  readonly VITE_EDAMAM_APP_KEY?: string;

  // 乗換検索API
  readonly VITE_TRANSIT_SERVICE?: 'mock' | 'osrm' | 'navitia' | 'google';
  readonly VITE_NAVITIA_TOKEN?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;

  // デバッグ
  readonly VITE_DEBUG_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

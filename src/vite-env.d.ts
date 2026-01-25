/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAKUTEN_APP_ID?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_RECIPE_SERVICE?: 'mealdb' | 'rakuten' | 'both';
  readonly VITE_TRANSIT_SERVICE?: 'google' | 'mock';
  readonly VITE_DEBUG_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

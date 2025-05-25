import Constants from "expo-constants";

export const TOGETHER_KEY =
  (Constants.expoConfig?.extra as any)?.TOGETHER_API_KEY ?? "";

export const LINGVANEX_KEY =
  (Constants.expoConfig?.extra as any)?.LINGVANEX_API_KEY ?? "";

export const OPENAI_KEY =
  (Constants.expoConfig?.extra as any)?.OPENAI_API_KEY ?? "";

export const AZURE_TTS_KEY =
  (Constants.expoConfig?.extra as any)?.AZURE_TTS_KEY ?? "";

export const AZURE_TTS_REGION =
  (Constants.expoConfig?.extra as any)?.AZURE_TTS_REGION ?? "eastus";

// Database paths
export const UNIHAN_DB_PATH = 'unihan.db';
export const CEDICT_DB_PATH = 'cedict.db';

// CDN/asset URLs
export const STROKE_ORDER_BASE_URL = 'https://your-cdn.com/strokes'; // Update with your CDN URL

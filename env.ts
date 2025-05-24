import Constants from "expo-constants";

export const TOGETHER_KEY =
  (Constants.expoConfig?.extra as any)?.TOGETHER_API_KEY ?? "";

export const AZURE_TTS_KEY =
  (Constants.expoConfig?.extra as any)?.AZURE_TTS_KEY ?? "";

export const AZURE_TTS_REGION =
  (Constants.expoConfig?.extra as any)?.AZURE_TTS_REGION ?? "";

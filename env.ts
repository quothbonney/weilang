import Constants from "expo-constants";

export const TOGETHER_KEY =
  (Constants.expoConfig?.extra as any)?.TOGETHER_API_KEY ?? "";

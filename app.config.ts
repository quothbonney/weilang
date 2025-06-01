import { ExpoConfig, ConfigContext } from "@expo/config";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "WeiLang",
  slug: "weilang",
  version: "1.0.0",
  scheme: "weilang",
  platforms: ["android", "web"],
  orientation: "portrait",
  icon: "./assets/squarelogo.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  android: {
    package: "com.yourname.weilang",
    // adaptiveIcon: {
    //   foregroundImage: "./assets/adaptive-icon.png",
    //   backgroundColor: "#FFFFFF",
    // },
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  extra: {
    "eas": { 
      "projectId": "747fb015-56d2-4a5b-a8ae-78e1d9f123ce" 
    },
    // Pass environment variables to the app
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
    LINGVANEX_API_KEY: process.env.LINGVANEX_API_KEY, 
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AZURE_TTS_KEY: process.env.AZURE_TTS_KEY,
    AZURE_TTS_REGION: process.env.AZURE_TTS_REGION || "eastus",
    CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT,
    CLOUDFLARE_R2_BUCKET: process.env.CLOUDFLARE_R2_BUCKET,
    S3_CLIENT_ACCESS_KEY: process.env.S3_CLIENT_ACCESS_KEY,
    S3_CLIENT_SECRET_ACCESS_KEY: process.env.S3_CLIENT_SECRET_ACCESS_KEY,
  },
});

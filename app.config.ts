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
  icon: "./assets/icon.png",
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
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
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
});

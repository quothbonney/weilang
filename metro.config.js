const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add path alias resolution
config.resolver.alias = {
  "@": "./src",
};
// Support WASM modules needed for expo-sqlite on web
config.resolver.assetExts.push('wasm');
module.exports = withNativeWind(config, { input: "./global.css" }); 
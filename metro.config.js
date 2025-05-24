const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add path alias resolution
config.resolver.alias = {
  "@": "./src",
};
const { getDefaultConfig } = require("expo/metro-config");
module.exports = withNativeWind(config, { input: "./global.css" }); 
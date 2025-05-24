const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add path alias resolution
config.resolver.alias = {
  "@": "./src",
};

module.exports = withNativeWind(config, { input: "./global.css" }); 
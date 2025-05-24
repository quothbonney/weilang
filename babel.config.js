// babel.config.js  – Expo SDK 50+, NativeWind v4

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',        // NativeWind v4 is a *preset*
    ],
    // plugins: [/* other plugins, put reanimated last if you keep it */],
  };
};
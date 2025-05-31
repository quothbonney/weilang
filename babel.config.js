// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      '@babel/plugin-transform-class-static-block' // Add this line
      // Add other plugins here. If you use 'react-native-reanimated', it should be the last plugin.
    ],
  };
};
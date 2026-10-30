module.exports = function (api) {
  api.cache(true);
  return {
    // NativeWind v4: JSX goes through nativewind's runtime so `className` works on core components.
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // Expo 50 resolves aliases from tsconfig.json; keep Reanimated last.
      'react-native-reanimated/plugin',
    ],
  };
};


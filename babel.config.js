module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // Expo 50 resolves aliases from tsconfig.json; keep Reanimated last.
      'react-native-reanimated/plugin',
    ],
  };
};


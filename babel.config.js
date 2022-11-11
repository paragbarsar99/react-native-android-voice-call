module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    production: {
      plugins: [
        'react-native-paper/babel',
        'react-native-reanimated/plugin',
        'transform-remove-console',
      ],
    },
    development: {
      plugins: ['react-native-reanimated/plugin'],
    },
  },
};

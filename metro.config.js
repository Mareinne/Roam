const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude react-native-reanimated and worklets from the bundle
// (not used in this project; their babel plugins cause conflicts)
config.resolver.blockList = [
  /node_modules\/react-native-reanimated\/.*/,
  /node_modules\/react-native-worklets\/.*/,
];

module.exports = config;

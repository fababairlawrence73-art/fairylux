module.exports = {
  preset: '@react-native/jest-preset',
  // Cold React Native transforms can be slow on Windows during native builds.
  testTimeout: 120000,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};

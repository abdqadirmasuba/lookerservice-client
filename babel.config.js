module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }], // ✅ Ensure correct preset
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin", // ✅ Keep reanimated
    ],
  };
};

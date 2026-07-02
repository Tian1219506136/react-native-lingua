// Added for zustand v5: its ESM build uses `import.meta`, which Hermes does not
// support. babel-preset-expo's polyfill transforms it at bundle time.
// NativeWind v5 needs no babel plugin — keep this file preset-only.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
  };
};

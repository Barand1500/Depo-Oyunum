module.exports = function expoBabelConfig(api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"]
  };
};
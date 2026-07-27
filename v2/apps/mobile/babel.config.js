module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // Migraciones de drizzle: importa los .sql generados como strings.
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getWebpackConfig = require('@nrwl/react/plugins/webpack');

module.exports = (config, context) => {
  const updatedConfig = getWebpackConfig(config, context);
  updatedConfig.module.rules.push({
    test: /\.wasm$/,
    type: 'javascript/auto',
    loader: 'file-loader',
    options: {
      name: '[name]-[hash].[ext]',
    },
  });
  return updatedConfig;
};

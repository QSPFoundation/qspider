// eslint-disable-next-line @typescript-eslint/no-var-requires
const getWebpackConfig = require('@nrwl/react/plugins/webpack');

module.exports = (config, context) => {
  const updatedConfig = getWebpackConfig(config, context);
  updatedConfig.module.rules.pop();
  updatedConfig.module.rules.push({
    test: /\.wasm$/,
    type: 'javascript/auto',
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
    },
  });
  updatedConfig.module.rules.push({
    test: /\.svg$/,
    use: [
      {
        loader: 'svg-sprite-loader',
        options: {},
      },
      'svg-transform-loader',
      'svgo-loader',
    ],
  });
  return updatedConfig;
};

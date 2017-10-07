/* global module */

const webpack = require('webpack'),
      commonConfig  = require('./webpack.config'),
      _       = require('lodash');

const config = _.cloneDeep(commonConfig);

config.devtool = 'cheap-module-eval-source-map';

config.plugins = [
  // Adds webpack HMR support. It act's like livereload,
  // reloading page after webpack rebuilt modules.
  // It also updates stylesheets and inline assets without page reloading.
  new webpack.HotModuleReplacementPlugin()
];

config.watchOptions = {
  ignored: /node_modules/,
  aggregateTimeout: 300,
  poll: 1000
};

module.exports = config;
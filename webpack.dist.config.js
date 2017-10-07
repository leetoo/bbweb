/* global module */

const webpack = require('webpack'),
      config  = require('./webpack.config'),
      BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//, CompressionPlugin = require('compression-webpack-plugin');

config.cache = false;
config.devtool = 'cheap-module-source-map';

config.plugins = config.plugins.concat([
  new BundleAnalyzerPlugin({
    analyzerMode: 'static'
  }),

  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }),

  new webpack.optimize.UglifyJsPlugin({
    ie8: false,
    parallel: true,
    exclude: [/\.min\.js$/gi], // skip pre-minified libs
    mangle: true,
    compress: {
      warnings: false // Suppress uglification warnings
    },
    output: {
      comments: false,
      beautify: false
    }
  }),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new webpack.NoEmitOnErrorsPlugin()
]);

module.exports = config;
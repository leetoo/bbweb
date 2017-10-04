/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2017 Canadian BioSample Repository (CBSR)
 *
 * Karma configuration
 */

/* global process, module, __dirname */
/* eslint no-process-env: "off" */

const path = require('path'),
      webpackConfig = require('./webpack.test.config');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = KarmaConf;

/*
 * Karma configuration
 */
function KarmaConf(config) {
  config.set({

    client: {
      captureConsole: false
    },

    // If using jasmine-core 2.6.0 the follwing settings are required
    // browserNoActivityTimeout: 60000,
    // browserDisconnectTimeout: 30000,
    // captureTimeout: 60000,

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'jasmine-jquery',
      'jasmine',
      'jasmine-matchers'
    ],

    // list of files / patterns to load in the browser
    files: [
      'app/assets/javascripts/test-app.js'
    ],

    preprocessors: {
      'app/assets/javascripts/test-app.js': ['webpack', 'sourcemap']
    },

    reporters: [
      'dots',
      //'spec'
      //'failed'
      'coverage-istanbul'
    ],

    coverageIstanbulReporter: {
      reports: [ 'html', 'text-summary' ],
      fixWebpackSourcePaths: true
    },

    specReporter: {
      maxLogLines: 10,
      prefixes: {
        // these are override here becasue the default values do not show up correctly when the tests are run
        // inside Emacs
        success: 'PASSED  ',
        failure: 'FAILED  ',
        skipped: 'SKIPPED '
      }
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'ChromeHeadless'
      // 'ChromeExtra'
    ],

    customLaunchers: {
      Chrome_with_debugging: {
        base: 'Chrome',
        chromeDataDir: path.resolve(__dirname, '.chrome')
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: 'errors-only'
    }

  });
}

/* eslint global-require: off, import/no-dynamic-require: off */

/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

const port = process.env.PORT || 1212;
process.env.PORT = port;

export default merge.smart(baseConfig, {
  devtool: 'cheap-eval-source-map',

  mode: 'development',

  entry: [
    'react-hot-loader/patch',
    'webpack/hot/only-dev-server',
    require.resolve('../src/render/index.tsx')
  ],

  output: {
    publicPath: '/',
    filename: 'renderer.dev.js'
  },

  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
  ],

  devServer: {
    port,
    compress: true,
    // noInfo: true,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    before() {
      require('child_process').spawn('yarn', ['start:main'], {
        env: process.env,
        stdio: 'inherit'
      })
    }
  }
});

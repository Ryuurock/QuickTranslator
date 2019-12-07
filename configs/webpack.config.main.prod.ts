import webpack from 'webpack';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { dependencies as externals } from '../package.json';

if (!process.env.GH_TOKEN) {
  throw new Error('未配置【GH_TOKEN】');
}

export default merge.smart({}, {
  devtool: false,

  target: 'electron-main',

  mode: 'production',

  entry: [
    require.resolve('../src/main/index.ts')
  ],

  node: {
    __dirname: false,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
    ]
  },

  resolve: {
    extensions: ['.js', '.tsx', '.ts', '.jsx'],
  },

  output: {
    publicPath: './dist/',
    filename: 'main.js',
    libraryTarget: 'commonjs2'
  },

  plugins: [
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
      NODE_ENV: 'production'
    }),
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        cache: true
      }),
    ]
  },

});

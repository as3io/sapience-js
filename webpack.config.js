const webpack = require('webpack');
const { resolve } = require('path');
const { getIfUtils, removeEmpty } = require('webpack-config-utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const srcDir = resolve(__dirname, 'src');

module.exports = function(env) {
  const { ifProd, ifNotProd } = getIfUtils(env);
  return {
    cache: ifNotProd(),
    entry: {
      'sapience': [
        './src/index.js',
      ],
    },
    devtool: ifProd('source-map', 'cheap-eval-source-map'),
    resolve: {
      extensions: ['.js', '.json'],
      modules: [
        srcDir,
        resolve(__dirname, 'node_modules'),
      ],
    },
    output: {
      filename: '[name].js',
      path: resolve(__dirname, 'dist'),
      publicPath: '/',
      // library: 'idme',
      // libraryTarget: 'umd',
      // umdNamedDefine: true,
    },
    devServer: {
      port: 3081,
      // proxy: {
      //   '/rest': {
      //     target: serverUrl,
      //     secure: false,
      //     changeOrigin: true,
      //   },
      //   '/component': {
      //     target: serverUrl,
      //     secure: false,
      //     changeOrigin: true,
      //   },
      // },
    },
    module: {
      rules: removeEmpty([
        {
          test: /\.jsx?$/,
          include: [ srcDir ],
          enforce: 'pre',
          loader: 'eslint-loader',
        },
        {
          test: /\.jsx?$/,
          include: [ srcDir ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
            },
          },
        },
      ]),
    },
    plugins: removeEmpty([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: ifProd('"production"', '"development"')
        }
      }),

      new HtmlWebpackPlugin({
        template: resolve(__dirname, 'src/index.html'),
        inject: false,
      }),

      ifProd(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: true
      })),

      ifProd(new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false
        },
        sourceMap: true
      })),

    ]),
  };
};

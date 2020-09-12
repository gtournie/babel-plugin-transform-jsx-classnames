const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [new webpack.optimize.OccurrenceOrderPlugin(), new webpack.optimize.ModuleConcatenationPlugin()],
  module: {
    noParse: [/node_modules\/benchmark/],
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|vendor)/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              // presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],
              plugins: [],
            },
          },
        ],
      },
    ],
  },
}

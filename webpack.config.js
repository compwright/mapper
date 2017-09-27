const path = require('path')
const config = require('config')
const { ProvidePlugin } = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const extractSass = new ExtractTextPlugin({
  filename: 'assets/bundle.css',
  disable: process.env.NODE_ENV === 'development'
})

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/bundle.js'
  },
  devServer: {},
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new ProvidePlugin({
      Handsontable: 'handsontable/dist/handsontable.full'
    }),
    extractSass,
    new HtmlWebpackPlugin({
      template: './index.ejs',
      filename: 'index.html',
      hash: true,
      ...JSON.parse(JSON.stringify(config))
    })
  ]
}

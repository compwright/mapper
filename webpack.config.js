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
  entry: path.resolve(__dirname, 'src', 'app.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/bundle.js'
  },
  devServer: {},
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ['transform-runtime', 'transform-object-rest-spread']
          }
        }
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/',
            publicPath: '/'
          }
        }]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new ProvidePlugin({
      Handsontable: 'ng-handsontable/node_modules/handsontable/dist/handsontable.full'
    }),
    extractSass,
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      filename: 'index.html',
      hash: true,
      ...JSON.parse(JSON.stringify(config))
    })
  ]
}

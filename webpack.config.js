'use strict';

const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
    watch: true,
    entry: [
        './src/main.js'
    ],
    output: {
        filename: 'myRedux.min.js',
        path: path.join(__dirname, './dist'),
        publicPath: './'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {loader: 'babel-loader'},
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['./app/dist']),
    ],
    resolve: {
        extensions: ['.js', '.json', '.jsx']
    }
}
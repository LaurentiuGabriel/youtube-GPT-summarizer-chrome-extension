const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        popup: './index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
        }, ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: "public"
            }, ],
        }),
        new HtmlWebpackPlugin({
            template: 'template.html',
            filename: '[name].html'
        })
    ],
};
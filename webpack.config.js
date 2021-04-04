const { resolve } = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: resolve(__dirname, 'src/index.jsx'),
    output: {
        path: resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [ '@babel/preset-react' ]
                    }
                }
            },
            {
                test: /\.sass$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.woff2?$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: resolve(__dirname, 'src/index.html')
        })
    ],
    devServer: {
        contentBase: resolve(__dirname, 'dist'),
        compress: true,
        port: 9000,
        host: "0.0.0.0",
        allowedHosts: [
            ".repl.it",
            ".repl.co",
            ".repl.run",
            ".ngrok.io"
        ]
    }
};

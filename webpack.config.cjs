const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeExternals = require('webpack-node-externals');
const path = require("path");

module.exports = {
    mode: 'development',

    entry: {
        client: './src/app-client.js',
        // server: './src/app-server.js',
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },

    watchOptions: {
        ignored: '/node_modules/',
    },

    // in order to ignore built-in modules like path, fs,
    target: 'node',

    // in order to ignore all modules in node_modules folder
    externals: [nodeExternals()],


    plugins: [
        new HtmlWebpackPlugin({
            template: "src/server/html/template.html"
        })
    ],

    module: {
        rules: [
            {
                test: /\.(css)$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|glb|gltf|tga)$/i,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
        ],
    },
};
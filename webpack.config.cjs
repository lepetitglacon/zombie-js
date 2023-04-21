const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',

    entry: {
        main: './src/app-client.js',
        // server: './src/app-server.js',
    },

    output: {
        filename: 'index.js',
    },

    watchOptions: {
        ignored: '/node_modules/',
    },

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
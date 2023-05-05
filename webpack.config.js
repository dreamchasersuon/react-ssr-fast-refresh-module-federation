const path = require("path");
const webpack = require('webpack');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const {ModuleFederationPlugin} = require('webpack').container;
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const deps = require('../../package.json').dependencies;
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const externals = require('./externals');

const environments = {
    production: false,
    buildInCI: false,
    measureIsDisabled: true,
    browser: false
};
const APP_ENTRY = 'app';

const mfConfig = new ModuleFederationPlugin({
    name: 'main',
    remotes: {
        builder: 'builder_account@[window.builderUrl]'
    },
    shared: {
        react: {
            singleton: true,
            requiredVersion: deps.react,
            eager: true
        },
        'react-dom': {
            singleton: true,
            requiredVersion: deps['react-dom']
        },
        'react-router': {
            singleton: true,
            requiredVersion: deps['react-router']
        },
        'react-router-dom': {
            singleton: true,
            requiredVersion: deps['react-router-dom']
        }
    }
});


const createConfig = ({env, ...rest}) =>
    ({
        mode: process.env.NODE_ENV,
        context: path.resolve(process.cwd(), 'app'),
        node: {__dirname: true, __filename: true},
        resolve: {
            extensions: ['.js', '.jsx'],
            symlinks: false,
            modules: [path.resolve(process.cwd(), 'app'), path.resolve(process.cwd(), 'node_modules')]
        },
        module: {
            rules: [
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false
                    }
                },
                {
                    test: /\.js$|\.jsx$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                                cacheCompression: false,
                                plugins: [
                                    env.browser && 'react-refresh/babel',
                                    '@babel/plugin-proposal-export-default-from',
                                    '@babel/plugin-syntax-dynamic-import'
                                ].filter(Boolean)
                            }
                        }
                    ],
                    include: [path.resolve(process.cwd(), 'app'), path.resolve(process.cwd(), 'server')],
                    exclude: /node_modules/
                }
            ]
        },
        plugins: env.browser ? [
            new CaseSensitivePathsPlugin(),
            new webpack.EnvironmentPlugin(environments),
            mfConfig,
            new ExternalTemplateRemotesPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new ReactRefreshWebpackPlugin({
                forceEnable: true,
                overlay: false,
                exclude: [/node_modules/, /bootstrap\.js$/]
            }),
            new WebpackManifestPlugin({
                fileName: '../manifest.json',
                publicPath: `${process.env.CDN_URL}/`,
                writeToFileEmit: true
            }),
            new webpack.ProvidePlugin({
                process: 'process/browser'
            })
        ] : [new CaseSensitivePathsPlugin(),
            new webpack.EnvironmentPlugin(environments),
            mfConfig,
            new ExternalTemplateRemotesPlugin()],
        devtool: 'eval-source-map',
        cache: process.env.NODE_ENV === 'development' ? {type: 'filesystem'} : false,
        stats: {
            all: false,
            chunkModules: true,
            assets: true,
            warnings: true,
            errors: true,
            colors: true
        },
        ...rest
    })

const browserConfig = env => {
    const entry = {[APP_ENTRY]: ['./index.jsx']};

    if (!env.production && env.browser) {
        entry[APP_ENTRY] = [
            '@gatsbyjs/webpack-hot-middleware/client',
            'react-refresh/runtime',
            './index.jsx'
        ];
    }

    const optimization = {
        moduleIds: 'named',
        chunkIds: 'named',
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'async'
        },
        usedExports: true
    };

    const fileNamePattern = '[name].js';

    return createConfig({
        name: 'client',
        entry,
        target: 'web',
        output: {
            path: path.resolve(process.cwd(), '.static'),
            filename: fileNamePattern,
            chunkFilename: fileNamePattern,
            publicPath: `${process.env.CDN_URL}/`
        },
        optimization,
        env
    });
};

const serverConfig = env =>
    createConfig({
        name: 'server',
        entry: {server: './../server/index'},
        target: 'node',
        output: {
            path: path.resolve(process.cwd(), '.compiled-server'),
            filename: '[name].js',
            publicPath: `${process.env.CDN_URL}/`,
            libraryTarget: 'commonjs2'
        },
        optimization: {
            minimize: false
        },
        externals,
        env
    });

module.exports = ({hrmBrowser = false} = {}) => {
    environments.browser = hrmBrowser;

    // eslint-disable-next-line no-console
    console.log(
        `Running webpack in ${process.env.NODE_ENV} mode on ${
            environments.browser ? 'browser' : 'server'
        }`
    );

    return environments.browser
        ? browserConfig({production: false, browser: true})
        : serverConfig({production: false, browser: false});
};

import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const initDevSetup = app => {
    const webpackConfig = require('./../webpack.config');
    const devBrowserConfig = webpackConfig({hrmBrowser: true});

    const compiler = webpack(devBrowserConfig);

    const dirName = path.resolve(__dirname, './app');

    compiler.hooks.afterEmit.tap('cleanup-the-require-cache', () => {
        // After webpack rebuild, clear the files from the require cache,
        // so that next server side render will be in sync
        Object.keys(require.cache)
            .filter(key => key.includes(dirName))
            .forEach(key => delete require.cache[key]);
    });

    app.use(
        webpackDevMiddleware(compiler, {
            publicPath: '/',
            writeToDisk: true,
            serverSideRender: true,
            stats: 'minimal',
        })
    );

    app.use(
        webpackHotMiddleware(compiler, {
            log: console.log, // eslint-disable-line no-console
            path: '/__webpack_hmr',
            heartbeat: 10 * 1000
        })
    );
};

export default initDevSetup;

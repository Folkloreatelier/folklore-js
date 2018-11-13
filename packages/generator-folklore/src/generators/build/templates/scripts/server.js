/* eslint-disable no-console, global-require */
/* eslint-disable import/no-extraneous-dependencies, import/no-dynamic-require, import/order */
const program = require('commander');

program
    .version('0.1.0')
    .option(
        '-c, --config [value]',
        'Webpack configuration',
        (val, configs) => (configs === null ? [val] : [...configs, val]),
        null,
    )
    .parse(process.argv);

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
    throw err;
});

// Ensure environment variables are read.
require('../env');

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const isArray = require('lodash/isArray');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
    choosePort,
    createCompiler,
    prepareProxy,
    prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const paths = require('../paths');
const { webpackDevServer: config } = require('../config');
const defaultWebpackConfig = require('../webpack.config.dev');
const createDevServerConfig = require('../webpackDevServer.config');

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

const webpackConfigs = program.config !== null
    ? program.config.map(configPath => require(path.join(process.env.PWD, configPath)))
    : defaultWebpackConfig;

const entries = isArray(webpackConfigs)
    ? webpackConfigs.reduce(
        (allEntries, webpackConfig) => [...allEntries, ...webpackConfig.entry],
        [],
    )
    : webpackConfigs.entry;

// Warn and crash if required files are missing
if (!checkRequiredFiles(entries)) {
    process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || config.browserHost || '0.0.0.0';

if (process.env.HOST) {
    console.log(
        chalk.cyan(
            `Attempting to bind to HOST environment variable: ${chalk.yellow(
                chalk.bold(process.env.HOST),
            )}`,
        ),
    );
    console.log(
        "If this was unintentional, check that you haven't mistakenly set it in your shell.",
    );
    console.log(`Learn more here: ${chalk.yellow('http://bit.ly/CRA-advanced-config')}`);
    console.log();
}

// We require that you explictly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper');

function mayProxy(pathname) {
    const maybePublicPath = path.resolve(paths.appPublic, pathname.slice(1));
    return !fs.existsSync(maybePublicPath);
}

checkBrowsers(paths.appPath, isInteractive)
    .then(() => choosePort(HOST, DEFAULT_PORT))
    .then((port) => {
        if (port == null) {
            // We have not found a port.
            return;
        }
        const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
        const appName = require(paths.appPackageJson).name;
        const urls = prepareUrls(protocol, HOST, port);
        // Create a webpack compiler that is configured with custom messages.
        const compiler = createCompiler(webpack, webpackConfigs, appName, urls, useYarn);
        // Load proxy config
        const proxySetting = config.proxy || require(paths.appPackageJson).proxy;
        const proxyConfig = prepareProxy(proxySetting, paths.appPublic) || null;
        // Serve webpack assets generated by the compiler over a web server.
        const serverConfig = createDevServerConfig(
            proxyConfig !== null ? [
                {
                    ...proxyConfig[0],
                    context(pathname, req) {
                        return (
                            req.method !== 'GET' || pathname === '/' || (mayProxy(pathname) && req.headers.accept)
                        );
                    },
                    changeOrigin: false,
                    autoRewrite: true,
                },
            ] : null,
            urls.lanUrlForConfig,
        );
        const devServer = new WebpackDevServer(compiler, serverConfig);
        // Launch WebpackDevServer.
        devServer.listen(port, HOST, (err) => {
            if (err) {
                console.log(err);
                return;
            }
            if (isInteractive) {
                clearConsole();
            }
            console.log(chalk.cyan('Starting the development server...\n'));
            openBrowser(urls.localUrlForBrowser);
        });

        ['SIGINT', 'SIGTERM'].forEach((sig) => {
            process.on(sig, () => {
                devServer.close();
                process.exit();
            });
        });
    })
    .catch((err) => {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    });

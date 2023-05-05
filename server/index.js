import express from 'express';
import 'regenerator-runtime/runtime';
import 'source-map-support/register';
import 'babel-polyfill';
import initDevSetup from './dev-setup';
import path from 'path';
import RouterMatch from "./router-match";

const {APP_ENV, NODE_ENV} = process.env;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const SERVER_TIMEOUT = 300000;
const app = express();

if (NODE_ENV === 'development') {
    initDevSetup(app);
}

app.use('/static', express.static('public'));
app.use('/static', express.static('.static'));

app.use(express.static(path.resolve(__dirname, '../dist')));

app.get('*', (req, res) => {
    RouterMatch(req, res);
});

app.use((err, req, res) => {
    res.status(200).send('Something broken!');
});

app.set('port', 3000);
app.set('https-port', 3001);
const server = app.listen(app.get('port'));
server.setTimeout(process.env.SERVER_TIMEOUT || SERVER_TIMEOUT);

/* eslint-disable */
console.log('\x1b[32m%s\x1b[0m', ' -----------------------');
console.log('\x1b[32m%s\x1b[0m', ' - Booted application');
/* eslint-enable */

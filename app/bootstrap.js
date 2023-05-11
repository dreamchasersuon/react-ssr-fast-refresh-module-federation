import React from 'react';
import {App} from './app';
import * as ReactDOM from "react-dom";

const env = process.env.NODE_ENV;

if (env === 'development') {
    const runtime = require('react-refresh/runtime');
    runtime.injectIntoGlobalHook(window);
}
const APP_NODE = document.querySelector(`#publisher-client`);

const renderMethod = env === 'production' ? ReactDOM.hydrate : ReactDOM.render;
renderMethod(<App />, APP_NODE);

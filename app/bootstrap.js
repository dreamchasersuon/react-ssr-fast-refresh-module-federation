import React from 'react';
import {hydrate} from 'react-dom';
import {App} from './app';


const APP_NODE = document.querySelector(`#publisher-client`);

const renderApp = () => {
    hydrate(<App />, APP_NODE);
};

renderApp();

import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import Route from "react-router-dom/Route";

export const App = () => {
    console.info('MY APP 6');

    return (
        <React.StrictMode>
            <BrowserRouter>
                <Route path="/" />
            </BrowserRouter>
        </React.StrictMode>
    );
};

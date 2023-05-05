import React from 'react';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import {Route} from "react-router-dom";
import util from "util";
import fs from "fs";
import getAssets from "./get-assets";

export default async function RouterMatch(req, res) {
    return Promise.all([])
        .then(async () => {
            const context = {};

            const renderedContent = renderToString(
                <StaticRouter location={req.url.replace(/\/{2,}/g, '/')} context={context}>
                    <Route path="/" />
                </StaticRouter>
            );

            const fsReadPromise = util.promisify(fs.readFile);

            const filePayload = await fsReadPromise(`${process.cwd()}/manifest.json`);
            const manifest = JSON.parse(filePayload);

            const assets = getAssets(manifest);

            const jsAssets = assets.jsAssets.reduce(
                (prev, asset) =>
                    (prev += `<script type="text/javascript" charset="utf-8" src="${asset}"></script>`),
                ''
            );

            return `<!doctype html>
  <html prefix="og: http://ogp.me/ns#">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="apple-itunes-app" content="app-id=1491307098">
    </head>
    <body> 
      <div id="google-map"></div>
      <div class="react-root" id="publisher-client">${renderedContent}</div>
      ${jsAssets}
    </body>
  </html>`;
        })
        .then(content => res.status(200).send(content));
}

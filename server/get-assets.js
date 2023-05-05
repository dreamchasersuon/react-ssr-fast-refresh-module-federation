
const APP_ENTRY = 'app';
const VENDORS_CHUNK = 'vendors';

const sortCssAssetsByPrior = (cssAssets) => {
    const cssAssetsOrder = new Map([
        [`${VENDORS_CHUNK}.css`, 1],
        [`${APP_ENTRY}.css`, 2]
    ]);

    const MINOR_ORDER = 999;

    return cssAssets.sort((a, b) => {
        const aOrder = cssAssetsOrder.get(a) || MINOR_ORDER;
        const bOrder = cssAssetsOrder.get(b) || MINOR_ORDER;

        return aOrder - bOrder;
    });
};

const getAssets = (manifest) => {
    const jsAssetsWhitelist = [`${APP_ENTRY}.js`, `${VENDORS_CHUNK}.js`, 'runtime.js'];

    const jsAssets = [];
    const cssAssetsKeys = [];

    for (let asset in manifest) {
        const isJsAsset = new RegExp(/.js$/);
        const isCssAsset = new RegExp(/.css$/);

        if (isJsAsset.test(asset) && jsAssetsWhitelist.includes(asset)) {
            jsAssets.push(manifest[asset]);
        }

        if (isCssAsset.test(asset)) {
            cssAssetsKeys.push(asset);
        }
    }

    const sortedCssAssetsKeys = sortCssAssetsByPrior(cssAssetsKeys);
    const cssAssets = sortedCssAssetsKeys.map(key => manifest[key]);

    return {
        jsAssets,
        cssAssets
    };
};

export default getAssets;

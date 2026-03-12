const path = require('path');
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Bypass lucide-react-native's exports map by building the CJS path directly
// from __dirname to avoid require.resolve() hitting the exports restriction.
const lucideCjsPath = path.join(
    __dirname,
    'node_modules',
    'lucide-react-native',
    'dist',
    'cjs',
    'lucide-react-native.js'
);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'lucide-react-native') {
        return {
            filePath: lucideCjsPath,
            type: 'sourceFile',
        };
    }
    if (originalResolveRequest) {
        return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });

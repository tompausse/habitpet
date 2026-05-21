const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force all "three" imports to resolve to the same CJS build so Metro never
// bundles two copies of Three.js (which causes the "Multiple instances" warning
// that breaks PBR materials and lighting).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/three/build/three.cjs'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

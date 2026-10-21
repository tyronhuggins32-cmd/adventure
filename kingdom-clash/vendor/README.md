# Bundled Three.js

Three.js 0.186.1, MIT license. See THREE-LICENSE.txt.

three.js is an ES module bundle containing the core exports and mergeGeometries. It is served locally so the game does not depend on a CDN.

To reproduce the bundle in a temporary directory:

```sh
npm install three@0.186.1 esbuild@0.28.2
```

Create entry.js:

```js
export * from 'three';
export {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
```

Build it:

```sh
npx esbuild entry.js --bundle --format=esm --minify --legal-comments=none --outfile=three.js
```

Copy the upstream Three.js LICENSE to THREE-LICENSE.txt alongside the resulting bundle.

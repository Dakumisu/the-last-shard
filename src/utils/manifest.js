import { store } from '@tools/Store';

/**
 * Assets es6 Map
 * @type {Map<string, {path: string | string[], data: any}>}
 */
const assetsMap = new Map();

// Fill Maps

assetsMap.set('envMap1', {
	path: [
		'/assets/image/environmentMaps/1/px.jpg',
		'/assets/image/environmentMaps/1/nx.jpg',
		'/assets/image/environmentMaps/1/py.jpg',
		'/assets/image/environmentMaps/1/ny.jpg',
		'/assets/image/environmentMaps/1/pz.jpg',
		'/assets/image/environmentMaps/1/nz.jpg',
	],
	data: {},
});

assetsMap.set('envMap2', {
	path: [
		'/assets/image/environmentMaps/2/px.png',
		'/assets/image/environmentMaps/2/nx.png',
		'/assets/image/environmentMaps/2/py.png',
		'/assets/image/environmentMaps/2/ny.png',
		'/assets/image/environmentMaps/2/pz.png',
		'/assets/image/environmentMaps/2/nz.png',
	],
	data: {},
});

assetsMap.set('asset_gradient', {
	path: '/assets/image/gradients/gradient.png',
	data: {},
});

assetsMap.set('noiseTexture', {
	path: '/assets/image/pattern.png',
	data: {},
});

assetsMap.set('grassTexture', {
	path: '/assets/image/grass.ktx2',
	data: {},
});
assetsMap.set('fogTexture', {
	path: '/assets/image/fog.png',
	data: {},
});

assetsMap.set('laserTexture', {
	path: '/assets/image/laser.png',
	data: {},
});

assetsMap.set('lua', {
	path: '/assets/model/lua.glb',
	data: {},
});

assetsMap.set('flower', {
	path: 'assets/model/flower.glb',
	data: {},
});

export async function loadManifest() {
	const scenesManifest = import.meta.globEager('../../public/assets/export/Scene_*.json');
	const terrainsSplatting = import.meta.globEager('../../public/assets/export/Scene_*.png');

	const manifest = [];

	for (const key in scenesManifest) {
		const _c = await scenesManifest[key];
		const _json = _c.default;
		const _n = key.split('/').pop().split('.')[0];
		manifest.push(_json);

		assetsMap.set(_n, {
			path: '/assets/export/' + _n + '.glb',
			data: {},
		});

		const _assets = _json.assets;
		_assets.forEach((asset) => {
			if (assetsMap.get(asset)) return;

			assetsMap.set(asset, {
				path: '/assets/export/Asset_' + asset + '.glb',
				data: {},
			});
		});
	}

	for (const key in terrainsSplatting) {
		const _n = key.split('/').pop().split('.')[0];

		assetsMap.set(_n, {
			path: '/assets/export/' + _n + '.png',
			data: {},
		});
	}

	store.manifest = manifest;
}

export default assetsMap;

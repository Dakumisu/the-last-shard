import { store } from '@tools/Store';
import { loadJSON } from 'philbin-packages/loader';

/**
 * Assets es6 Map
 * @type {Map<string, {path: string | string[], data: any}>}
 */
const assetsMap = new Map();

// Fill Maps

assetsMap.set('envMap1', {
	path: [
		'/assets/image/environmentMaps/1/px.png',
		'/assets/image/environmentMaps/1/nx.png',
		'/assets/image/environmentMaps/1/py.png',
		'/assets/image/environmentMaps/1/ny.png',
		'/assets/image/environmentMaps/1/pz.png',
		'/assets/image/environmentMaps/1/nz.png',
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

assetsMap.set('noiseTexture', {
	path: '/assets/image/pattern.png',
	data: {},
});

assetsMap.set('grassTexture', {
	path: '/assets/image/grass.png',
	data: {},
});

export async function loadManifest() {
	const scenesManifest = import.meta.globEager('../../public/assets/export/Scene_*.json', {
		as: 'raw',
	});

	console.log(scenesManifest);

	const manifest = [];

	for (const path in scenesManifest) {
		const _c = await scenesManifest[path];
		const _json = _c.default;
		const _n = path.split('/').pop().split('.')[0];

		assetsMap.set(_n, {
			path: '../../assets/export/' + _n + '.glb',
			data: {},
		});

		for (const key in scenesManifest) {
			const _assets = scenesManifest[key].assets;

			_assets.forEach((asset) => {
				if (assetsMap.get(asset)) return;

				assetsMap.set(asset, {
					path: '../../assets/export/Asset_' + asset + '.glb',
					data: {},
				});
			});
		}

		manifest.push(_json);
	}

	store.manifest = manifest;
}

export default assetsMap;

import { loadJSON } from 'philbin-packages/loader';

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

assetsMap.set('noiseTexture', {
	path: '/assets/image/pattern.png',
	data: {},
});

assetsMap.set('grassTexture', {
	path: '/assets/image/grass.ktx2',
	data: {},
});

assetsMap.set('laserTexture', {
	path: '/assets/image/laser.png',
	data: {},
});

export async function loadManifestAssets() {
	const manifestPath = 'assets/export/Scenes.json';
	const scenesManifest = await loadJSON(manifestPath);

	for (const key in scenesManifest) {
		const _assets = scenesManifest[key].assets;

		_assets.forEach((asset) => {
			assetsMap.set(asset, {
				path: '/assets/export/Asset_' + asset + '.glb',
				data: {},
			});
		});
	}
}

export default assetsMap;

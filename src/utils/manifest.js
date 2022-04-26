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
	path: '/assets/image/perlinNoise.jpeg',
	data: {},
});

const assetsPath = import.meta.glob('../../public/assets/export/*.glb');

for (const path in assetsPath) {
	const _p = assetsPath[path].name.split('../../public').pop();

	const _n = assetsPath[path].name
		.split('../../public/assets/export/')
		.pop()
		.split('.glb')
		.shift()
		.toLowerCase();

	assetsMap.set(_n, {
		path: _p,
		data: {},
		isLoading: false,
	});
}

export default assetsMap;

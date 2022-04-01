/**
 * Assets es6 Map
 * @type {Map<string, {path: string | string[], data: {}}>}
 */
const assetsMap = new Map();

// Fill Maps

assetsMap.set('envMap1', {
	path: [
		'/assets/image/environmentMaps/1/px.ktx2',
		'/assets/image/environmentMaps/1/nx.ktx2',
		'/assets/image/environmentMaps/1/py.ktx2',
		'/assets/image/environmentMaps/1/ny.ktx2',
		'/assets/image/environmentMaps/1/pz.ktx2',
		'/assets/image/environmentMaps/1/nz.ktx2',
	],
	data: {},
});

assetsMap.set('envMap2', {
	path: [
		'/assets/image/environmentMaps/2/px.ktx2',
		'/assets/image/environmentMaps/2/nx.ktx2',
		'/assets/image/environmentMaps/2/py.ktx2',
		'/assets/image/environmentMaps/2/ny.ktx2',
		'/assets/image/environmentMaps/2/pz.ktx2',
		'/assets/image/environmentMaps/2/nz.ktx2',
	],
	data: {},
});

assetsMap.set('noiseTexture', { path: '/assets/image/perlinNoise.jpeg', data: {} });

export default assetsMap;

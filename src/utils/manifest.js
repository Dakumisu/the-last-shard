/**
 * Assets es6 Map
 * @type {Map<string, {path: string | string[], data: {}}>}
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

// assetsMap.set('test', { path: 'test', data: {} });

export default assetsMap;

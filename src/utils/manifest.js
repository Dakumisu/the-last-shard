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
	path: '/assets/image/gradients/gradient.jpg',
	data: {},
});

assetsMap.set('noiseTexture', {
	path: '/assets/image/noiseTexture.png',
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

assetsMap.set('grassPattern', {
	path: '/assets/image/grassTest.png',
	data: {},
});

assetsMap.set('grassAlpha', {
	path: '/assets/image/alpha.jpg',
	data: {},
});

assetsMap.set('grassDiffuse', {
	path: '/assets/image/diffuse.jpg',
	data: {},
});

assetsMap.set('laserTexture', {
	path: '/assets/image/laser.png',
	data: {},
});

assetsMap.set('characterTexture', {
	path: '/assets/image/character.jpg',
	data: {},
});

assetsMap.set('petTexture', {
	path: '/assets/image/pet.jpg',
	data: {},
});

assetsMap.set('portalTexture', {
	path: '/assets/image/portalTexture.png',
	data: {},
});
assetsMap.set('portalTexture2', {
	path: '/assets/image/portalTexture2.png',
	data: {},
});
assetsMap.set('portalTextureMask', {
	path: '/assets/image/portalMask.jpg',
	data: {},
});

assetsMap.set('lut-1', {
	path: '/assets/luts/lut-1.cube',
	data: {},
});

assetsMap.set('lut-2', {
	path: '/assets/luts/lut-2.cube',
	data: {},
});

assetsMap.set('lut-3', {
	path: '/assets/luts/lut-3.cube',
	data: {},
});

assetsMap.set('lut-4', {
	path: '/assets/luts/lut-4.cube',
	data: {},
});

assetsMap.set('lua', {
	path: '/assets/model/lua.glb',
	data: {},
});

assetsMap.set('pissenli', {
	path: 'assets/model/pissenli.glb',
	data: {},
});

assetsMap.set('pissenliTexture', {
	path: '/assets/image/pissenli.jpeg',
	data: {},
});

assetsMap.set('flowerTexture', {
	path: '/assets/image/flower.png',
	data: {},
});

assetsMap.set('lavande', {
	path: 'assets/model/lavande.glb',
	data: {},
});

assetsMap.set('lavandeTexture', {
	path: '/assets/image/lavande.jpeg',
	data: {},
});

assetsMap.set('flower1', {
	path: 'assets/model/flower1.glb',
	data: {},
});

assetsMap.set('flower2', {
	path: 'assets/model/flower2.glb',
	data: {},
});

assetsMap.set('flower3', {
	path: 'assets/model/flower3.glb',
	data: {},
});
assetsMap.set('flower4', {
	path: 'assets/model/flower4.glb',
	data: {},
});
assetsMap.set('flower5', {
	path: 'assets/model/flower5.glb',
	data: {},
});
assetsMap.set('flower6', {
	path: 'assets/model/flower6.glb',
	data: {},
});

// AUDIO
assetsMap.set('laser-sound', {
	path: 'assets/sound/interactions/laser.mp3',
	data: {},
});
assetsMap.set('laser-rotate-sound', {
	path: 'assets/sound/interactions/laser-rotate.mp3',
	data: {},
});
assetsMap.set('laser-activate-sound', {
	path: 'assets/sound/interactions/laser-activate.mp3',
	data: {},
});
assetsMap.set('checkpoint-sound', {
	path: 'assets/sound/interactions/checkpoint.mp3',
	data: {},
});
assetsMap.set('timer-sound', {
	path: 'assets/sound/interactions/timer.mp3',
	data: {},
});
assetsMap.set('footsteps-ground-sound', {
	path: 'assets/sound/characters/footsteps-ground.mp3',
	data: {},
});
assetsMap.set('footsteps-grass-sound', {
	path: 'assets/sound/characters/footsteps-grass.mp3',
	data: {},
});
assetsMap.set('fall-sound', {
	path: 'assets/sound/characters/fall.mp3',
	data: {},
});
assetsMap.set('jump-sound', {
	path: 'assets/sound/characters/jump.mp3',
	data: {},
});
assetsMap.set('pet-tp-sound', {
	path: 'assets/sound/characters/pet-tp.mp3',
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

		assetsMap.set(_n + '-sound', {
			path: '/assets/sound/ambient/' + _n + '.mp3',
			data: {},
		});

		const _assets = _json.assets;
		if (_assets) {
			_assets.forEach((asset) => {
				if (assetsMap.get(asset)) return;

				assetsMap.set(asset, {
					path: '/assets/export/Asset_' + asset + '.glb',
					data: {},
				});
			});
		}
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

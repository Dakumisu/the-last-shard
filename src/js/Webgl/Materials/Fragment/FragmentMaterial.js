import { DoubleSide } from 'three';
import { BaseToonMaterial } from '../BaseMaterials/toon/material';
import { Material, UniformsUtils } from 'three';
import { store } from '@tools/Store';
import hotShaders from './hotShaders';

export default class FragmentMaterial extends BaseToonMaterial {
	constructor() {
		super({
			side: DoubleSide,
			transparent: true,
			uniforms: {
				uAlpha: { value: 1 },
				uNoise: { value: getNoiseTexture() },
			},
		});

		hotShaders.use(this);
	}
}

function getNoiseTexture() {
	return store.loadedAssets.textures.get('noiseTexture');
}

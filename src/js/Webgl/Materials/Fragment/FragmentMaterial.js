import { DoubleSide } from 'three';
import { BaseToonMaterial } from '../BaseMaterials/toon/material';
import { Material, UniformsUtils } from 'three';
import { store } from '@tools/Store';
import hotShaders from './hotShaders';

export default class FragmentMaterial extends BaseToonMaterial {
	constructor(params) {
		super(params);

		hotShaders.use(this);
	}
}

const getGradientTexture = () => {
	const gradient = store.loadedAssets.textures.get('asset_gradient');
	gradient.flipY = false;
	gradient.needsUpdate = true;

	return gradient;
};

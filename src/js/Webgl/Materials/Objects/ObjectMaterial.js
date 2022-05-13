import { DoubleSide } from 'three';
import { BaseToonMaterial } from '../BaseMaterials/toon/material';
import { Material, UniformsUtils } from 'three';
import { store } from '@tools/Store';

let singleton;
export default class ObjectMaterial extends BaseToonMaterial {
	constructor() {
		super({
			side: DoubleSide,
			map: getGradientTexture(),
		});
	}
}

const getGradientTexture = () => {
	const gradient = store.loadedAssets.textures.get('asset_gradient');
	gradient.flipY = false;
	gradient.needsUpdate = true;

	return gradient;
};

ObjectMaterial.use = () => {
	return singleton || (singleton = new ObjectMaterial());
};

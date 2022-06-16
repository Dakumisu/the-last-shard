import { DoubleSide } from 'three';
import { BaseToonMaterial } from '../BaseMaterials/toon/material';
import { Material, UniformsUtils } from 'three';
import { store } from '@tools/Store';
import hotShaders from './hotShaders';

let singleton;
export default class LeavesMaterial extends BaseToonMaterial {
	constructor() {
		super({
			side: DoubleSide,
			transparent: true,
			depthWrite: false,
			uniforms: {
				uMap: { value: getGradientTexture() },
			},
		});
		hotShaders.use(this);
	}
}

const getGradientTexture = () => {
	const gradient = store.loadedAssets.textures.get('asset_gradient');
	gradient.flipY = false;
	gradient.needsUpdate = true;

	return gradient;
};

LeavesMaterial.use = () => {
	return singleton || (singleton = new LeavesMaterial());
};

import { loadTexture } from '@utils/loaders';
import { loadLUTTexture } from '@utils/loaders/loadAssets';

export default class Lut {
	constructor({ material, lutKey }) {
		this.material = material;
		this.lutKey = lutKey;

		this.initialized = false;

		this.init();
	}

	async init() {
		this.texture = await loadLUTTexture(this.lutKey);

		if (this.texture !== this.material.uniforms.lut) {
			this.material.uniforms.uLutSize.value = this.texture.image.width;
			this.material.uniforms.uLut1.value = this.texture;
		}
		this.initialized = true;
	}
}

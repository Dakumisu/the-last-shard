import { loadTexture } from '@utils/loaders';
import { loadLUTTexture } from '@utils/loaders/loadAssets';

export default class Lut {
	constructor({ material, lutKey }) {
		this.material = material;
		this.lutKey = lutKey;

		this.intensity = 1;

		this.initialized = false;

		this.init();
	}

	async init() {
		this.texture = await loadLUTTexture(this.lutKey);
		console.log('🎮 Loaded :', this.lutKey, this.texture);

		if (this.texture !== this.material.uniforms.lut) {
			this.material.uniforms.lutSize.value = this.texture.image.width;
			this.material.uniforms.lut.value = this.texture;
		}
		this.initialized = true;
	}

	set intensity(v) {
		this.material.uniforms.intensity.value = v;
	}
}

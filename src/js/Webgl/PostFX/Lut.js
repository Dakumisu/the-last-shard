import { loadTexture } from '@utils/loaders';
import { loadLUTTexture } from '@utils/loaders/loadAssets';

export default class Lut {
	constructor({ material, lutKey }) {
		this.material = material;
		this.lutKey = lutKey;

		this.initialized = false;
	}

	async load() {
		this.texture = await loadLUTTexture(this.lutKey);
		this.size = this.texture.image.width;
		this.initialized = true;
	}
}

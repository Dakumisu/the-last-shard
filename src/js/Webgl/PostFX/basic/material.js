import { RawShaderMaterial } from 'three';

import hotShaders from './hotShaders';

let instance;

export default class PostProcessingMaterial extends RawShaderMaterial {
	constructor(opts = {}) {
		super();

		for (const opt in opts) {
			this[opt] = opts[opt];
		}

		hotShaders.use(this);
	}
}

PostProcessingMaterial.get = (opts) => (instance = instance || new PostProcessingMaterial(opts));

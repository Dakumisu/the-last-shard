import { ShaderMaterial } from 'three';

import hotShaders from './hotShaders';

let instance;

export default class basicMaterial extends ShaderMaterial {
	constructor(opts = {}) {
		super();

		for (const opt in opts) {
			this[opt] = opts[opt];
		}

		hotShaders.use(this);
	}
}

basicMaterial.get = (opts) => (instance = instance || new basicMaterial(opts));

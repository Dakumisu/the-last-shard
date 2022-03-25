import { AdditiveBlending, Color } from 'three';
import { BaseBasicMaterial } from '../BaseMaterials/basic/material';

export default class debugMaterial extends BaseBasicMaterial {
	constructor(opts = {}) {
		super();

		this.color = new Color('#333333');
		this.opacity = 0.5;
		this.transparent = true;
		this.blending = AdditiveBlending;

		for (const opt in opts) {
			this[opt] = opts[opt];
		}
	}
}

debugMaterial.get = (opts) => new debugMaterial(opts);

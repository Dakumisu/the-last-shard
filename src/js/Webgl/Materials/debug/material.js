import { AdditiveBlending, Color, MeshBasicMaterial } from 'three';

export default class debugMaterial extends MeshBasicMaterial {
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

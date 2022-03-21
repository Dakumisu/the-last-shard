import { Color, DoubleSide, MeshStandardMaterial } from 'three';

let instance;

export default class defaultMaterial extends MeshStandardMaterial {
	constructor(opts = {}) {
		super();

		this.color = new Color('#ffffff');
		this.side = DoubleSide;

		for (const opt in opts) {
			this[opt] = opts[opt];
		}
	}
}

defaultMaterial.get = (opts) => new defaultMaterial(opts);

import { Color, DoubleSide, MeshStandardMaterial } from 'three';

let instance;

export default class DefaultMaterial extends MeshStandardMaterial {
	static defaultUniforms = {
		uTime: { value: 0 },
	};
	constructor(opts = {}) {
		super(opts);
		this.uniforms = opts.uniforms;

		this.color = new Color('#ffffff');
		this.side = DoubleSide;
	}

	static get(opts) {
		return new DefaultMaterial(opts);
	}
}

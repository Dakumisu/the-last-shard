import {
	Color,
	DoubleSide,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	UniformsUtils,
} from 'three';

let instance;

export default class fogMaterial extends MeshToonMaterial {
	constructor(opts = {}) {
		super();

		this.color = new Color('#a8b556');
		this.transparent = true;
		this.side = DoubleSide;

		for (const opt in opts) {
			this[opt] = opts[opt];
		}

		this.onBeforeCompile = (shader) => {
			shader.uniforms = UniformsUtils.merge([shader.uniforms, opts.uniforms]);
			this.uniforms = shader.uniforms;
		};
	}
}

fogMaterial.get = (opts) => (instance = instance || new fogMaterial(opts));

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
		super(opts);
		this.uniforms = opts.uniforms;

		this.side = DoubleSide;

		this.onBeforeCompile = (shader) => {
			shader.uniforms = { ...shader.uniforms, ...opts.uniforms };
			this.uniforms = shader.uniforms;
		};
	}
}

fogMaterial.get = (opts) => (instance = instance || new fogMaterial(opts));

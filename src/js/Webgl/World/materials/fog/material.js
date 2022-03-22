import {
	Color,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	UniformsUtils,
} from 'three';

let instance;

export default class fogMaterial extends MeshToonMaterial {
	constructor(opts = {}) {
		super();

		this.color = new Color('#efd1b5');

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

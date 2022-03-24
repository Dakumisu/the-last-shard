import {
	Color,
	CubeTextureLoader,
	DataTexture,
	DoubleSide,
	LuminanceFormat,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	NearestFilter,
	RGBAFormat,
	UniformsUtils,
} from 'three';

let instance;

const stepSize = 1.0 / 5;

export default class fogMaterial extends MeshToonMaterial {
	constructor(opts = {}) {
		super();

		for (let alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex++) {
			const colors = new Uint8Array(alphaIndex + 2);

			for (let c = 0; c <= colors.length; c++) {
				colors[c] = (c / colors.length) * 256;
			}

			this.grad = new DataTexture(colors, colors.length, 1, LuminanceFormat);
			this.grad.needsUpdate = true;
		}

		this.color = new Color('#d29ddc');
		this.transparent = true;
		this.gradientMap = this.grad;

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

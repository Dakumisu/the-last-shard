import {
	Color,
	DataTexture,
	LuminanceFormat,
	RedFormat,
	ShaderLib,
	ShaderMaterial,
	UniformsLib,
	UniformsUtils,
} from 'three';
import baseUniforms from '../baseUniforms';
import defaultVertex from './shaders/defaultVertex.glsl';
import defaultFragment from './shaders/defaultFragment.glsl';

export class CustomMeshToonMaterial extends ShaderMaterial {
	static instance;
	static gradientMap;

	constructor(opts = {}) {
		if (!CustomMeshToonMaterial.gradientMap) CustomMeshToonMaterial.setGradientMap();

		if (!opts.fragmentShader && !opts.vertexShader) {
			opts.fragmentShader = defaultFragment;
			opts.vertexShader = defaultVertex;
		}

		opts.uniforms = {
			...ShaderLib.toon.uniforms,
			gradientMap: { value: CustomMeshToonMaterial.gradientMap },
			...opts.uniforms,
			...baseUniforms,
		};

		super(opts);

		this.defines = {
			TOON: '',
		};

		this.lights = true;
		this.fog = true;
		this.transparent = true;

		this.type = 'ShaderMaterial';
		this.isShaderMaterial = true;

		this.gradientMap = this.uniforms.gradientMap.value;
	}

	static setGradientMap() {
		const colors = new Uint8Array(5 + 2);

		for (let c = 0; c <= colors.length; c++) {
			colors[c] = (c / colors.length) * 256;
		}

		CustomMeshToonMaterial.gradientMap = new DataTexture(colors, colors.length, 1, RedFormat);
		CustomMeshToonMaterial.gradientMap.needsUpdate = true;
	}

	static get(opts) {
		return (CustomMeshToonMaterial.instance =
			CustomMeshToonMaterial.instance || new CustomMeshToonMaterial(opts));
	}
}

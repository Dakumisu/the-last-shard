import { Color, ShaderLib, ShaderMaterial, UniformsLib, UniformsUtils } from 'three';
import baseUniforms from '../baseUniforms';
import defaultVertex from './shaders/defaultVertex.glsl';
import defaultFragment from './shaders/defaultFragment.glsl';

export class CustomMeshStandardMaterial extends ShaderMaterial {
	static instance;

	constructor(opts = {}) {
		if (!opts.fragmentShader && !opts.vertexShader) {
			opts.fragmentShader = defaultFragment;
			opts.vertexShader = defaultVertex;
		}

		opts.uniforms = {
			...ShaderLib.standard.uniforms,
			...opts.uniforms,
			...baseUniforms,
		};

		super(opts);

		this.defines = {
			STANDARD: '',
		};

		this.lights = true;
		this.fog = true;

		this.type = 'ShaderMaterial';
		this.isShaderMaterial = true;
	}

	static get(opts) {
		return (CustomMeshStandardMaterial.instance =
			CustomMeshStandardMaterial.instance || new CustomMeshStandardMaterial(opts));
	}
}

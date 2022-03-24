import { ShaderMaterial, UniformsLib, UniformsUtils } from 'three';
import baseUniforms from '../baseUniforms';
import defaultVertex from './shaders/defaultVertex.glsl';
import defaultFragment from './shaders/defaultFragment.glsl';

export class CustomMeshBasicMaterial extends ShaderMaterial {
	static instance;

	constructor(opts = {}) {
		if (!opts.fragmentShader && !opts.vertexShader) {
			opts.fragmentShader = defaultFragment;
			opts.vertexShader = defaultVertex;
		}
		opts.uniforms = UniformsUtils.merge([
			UniformsLib.common,
			UniformsLib.specularmap,
			UniformsLib.envmap,
			UniformsLib.aomap,
			UniformsLib.lightmap,
			UniformsLib.fog,
			opts.uniforms,
			baseUniforms,
		]);
		super(opts);
	}

	static get(opts) {
		return (CustomMeshBasicMaterial.instance =
			CustomMeshBasicMaterial.instance || new CustomMeshBasicMaterial(opts));
	}
}

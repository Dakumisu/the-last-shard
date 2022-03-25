import { Color, ShaderMaterial, UniformsLib, UniformsUtils } from 'three';
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
		opts.uniforms = UniformsUtils.merge([
			UniformsLib.common,
			UniformsLib.envmap,
			UniformsLib.aomap,
			UniformsLib.lightmap,
			UniformsLib.emissivemap,
			UniformsLib.bumpmap,
			UniformsLib.normalmap,
			UniformsLib.displacementmap,
			UniformsLib.roughnessmap,
			UniformsLib.metalnessmap,
			UniformsLib.fog,
			UniformsLib.lights,
			{
				emissive: { value: new Color(0x000000) },
				roughness: { value: 1.0 },
				metalness: { value: 0.0 },
				envMapIntensity: { value: 1 }, // temporary
			},
			opts.uniforms,
			baseUniforms,
		]);
		console.log(UniformsLib.lights);
		super(opts);
	}

	static get(opts) {
		return (CustomMeshStandardMaterial.instance =
			CustomMeshStandardMaterial.instance || new CustomMeshStandardMaterial(opts));
	}
}

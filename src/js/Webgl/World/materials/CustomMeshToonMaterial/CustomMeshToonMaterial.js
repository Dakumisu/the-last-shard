import { Color, ShaderMaterial, UniformsLib, UniformsUtils } from 'three';
import baseUniforms from '../baseUniforms';
import defaultVertex from './shaders/defaultVertex.glsl';
import defaultFragment from './shaders/defaultFragment.glsl';

export class CustomMeshToonMaterial extends ShaderMaterial {
	static instance;

	constructor(opts = {}) {
		if (!opts.fragmentShader && !opts.vertexShader) {
			opts.fragmentShader = defaultFragment;
			opts.vertexShader = defaultVertex;
		}
		opts.uniforms = UniformsUtils.merge([
			UniformsLib.common,
			UniformsLib.aomap,
			UniformsLib.lightmap,
			UniformsLib.emissivemap,
			UniformsLib.bumpmap,
			UniformsLib.normalmap,
			UniformsLib.displacementmap,
			UniformsLib.gradientmap,
			UniformsLib.fog,
			UniformsLib.lights,
			{
				emissive: { value: new Color(0x000000) },
			},
			opts.uniforms,
			baseUniforms,
		]);
		super(opts);

		this.lights = true;
		this.fog = true;
	}

	static get(opts) {
		return (CustomMeshToonMaterial.instance =
			CustomMeshToonMaterial.instance || new CustomMeshToonMaterial(opts));
	}
}

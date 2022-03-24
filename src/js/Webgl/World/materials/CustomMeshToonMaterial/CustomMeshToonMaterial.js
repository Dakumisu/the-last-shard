import {
	Color,
	DataTexture,
	LuminanceFormat,
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
				gradientMap: { value: CustomMeshToonMaterial.gradientMap },
			},
			opts.uniforms,
			// baseUniforms,
		]);
		opts.uniforms = { ...opts.uniforms, ...baseUniforms };
		super(opts);

		this.defines = {
			TOON: '',
		};
		this.lights = true;
		this.fog = true;
		this.transparent = true;
		this.gradientMap = CustomMeshToonMaterial.gradientMap;
	}

	static setGradientMap() {
		const colors = new Uint8Array(5 + 2);

		for (let c = 0; c <= colors.length; c++) {
			colors[c] = (c / colors.length) * 256;
		}

		CustomMeshToonMaterial.gradientMap = new DataTexture(
			colors,
			colors.length,
			1,
			LuminanceFormat,
		);
		CustomMeshToonMaterial.gradientMap.needsUpdate = true;
	}

	static get(opts) {
		return (CustomMeshToonMaterial.instance =
			CustomMeshToonMaterial.instance || new CustomMeshToonMaterial(opts));
	}
}

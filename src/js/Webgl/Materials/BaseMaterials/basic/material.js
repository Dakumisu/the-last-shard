import {
	Material,
	Color,
	ShaderMaterial,
	UniformsLib,
	UniformsUtils,
	MultiplyOperation,
	ShaderLib,
} from 'three';
import baseUniforms from '../../baseUniforms';
import defaultVertex from './defaultVertex.glsl';
import defaultFragment from './defaultFragment.glsl';

class BaseBasicMaterial extends Material {
	constructor(parameters) {
		super();

		this.uniforms = {
			...ShaderLib.basic.uniforms,
			...parameters.uniforms,
			...baseUniforms,
		};

		this.type = 'ShaderMaterial';

		this.color = new Color(0xffffff); // emissive

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.specularMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.combine = MultiplyOperation;
		this.reflectivity = 1;
		this.refractionRatio = 0.98;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.vertexShader = defaultVertex;
		this.fragmentShader = defaultFragment;

		this.linewidth = 1;

		this.wireframe = false;
		this.wireframeLinewidth = 1;

		this.fog = true; // set to use scene fog
		// this.lights = true; // set to use scene lights
		this.clipping = false; // set to use user-defined clipping planes

		this.extensions = {
			derivatives: false, // set to use derivatives
			fragDepth: false, // set to use fragment depth values
			drawBuffers: false, // set to use draw buffers
			shaderTextureLOD: false, // set to use shader texture LOD
		};

		// When rendered geometry doesn't include these attributes but the material does,
		// use these default values in WebGL. This avoids errors when buffer data is missing.
		this.defaultAttributeValues = {
			color: [1, 1, 1],
			uv: [0, 0],
			uv2: [0, 0],
		};

		this.index0AttributeName = undefined;
		this.uniformsNeedUpdate = false;

		this.glslVersion = null;

		this.setValues(parameters);
	}

	// Use with care, not tested at the moment
	copy(source) {
		super.copy(source);

		this.color.copy(source.color);

		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.specularMap = source.specularMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.combine = source.combine;
		this.reflectivity = source.reflectivity;
		this.refractionRatio = source.refractionRatio;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.vertexShader = source.vertexShader;
		this.fragmentShader = source.fragmentShader;

		this.linewidth = source.linewidth;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;

		this.fog = source.fog;
		this.lights = source.lights;
		this.clipping = source.clipping;

		this.extensions = source.extensions;

		// When rendered geometry doesn't include these attributes but the material does,
		// use these default values in WebGL. This avoids errors when buffer data is missing.
		this.defaultAttributeValues = source.defaultAttributeValues;

		this.index0AttributeName = undefined;
		this.uniformsNeedUpdate = false;

		this.glslVersion = null;

		return this;
	}
}

BaseBasicMaterial.prototype.isMeshBasicMaterial = true;
BaseBasicMaterial.prototype.isShaderMaterial = true;

export { BaseBasicMaterial };

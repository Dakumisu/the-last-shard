import { Color, Material, ShaderLib, TangentSpaceNormalMap, Vector2 } from 'three';
import defaultVertex from './defaultVertex.glsl';
import defaultFragment from './defaultFragment.glsl';
import baseUniforms from '@webgl/Materials/baseUniforms';

class BaseStandardMaterial extends Material {
	constructor(parameters) {
		super();

		this.uniforms = {
			...ShaderLib.standard.uniforms,
			...parameters.uniforms,
			...baseUniforms,
		};

		this.defines = { STANDARD: '' };

		this.type = 'ShaderMaterial';

		this.color = new Color(0xffffff); // diffuse
		this.roughness = 1.0;
		this.metalness = 0.0;

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.emissive = new Color(0x000000);
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalMapType = TangentSpaceNormalMap;
		this.normalScale = new Vector2(1, 1);

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.roughnessMap = null;

		this.metalnessMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.envMapIntensity = 1.0;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.flatShading = false;

		this.vertexShader = defaultVertex;
		this.fragmentShader = defaultFragment;

		this.linewidth = 1;

		this.wireframe = false;
		this.wireframeLinewidth = 1;

		this.fog = true; // set to use scene fog
		this.lights = true; // set to use scene lights
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

		this.defines = { STANDARD: '' };

		this.color.copy(source.color);
		this.roughness = source.roughness;
		this.metalness = source.metalness;

		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.emissive.copy(source.emissive);
		this.emissiveMap = source.emissiveMap;
		this.emissiveIntensity = source.emissiveIntensity;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy(source.normalScale);

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.roughnessMap = source.roughnessMap;

		this.metalnessMap = source.metalnessMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.envMapIntensity = source.envMapIntensity;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.flatShading = source.flatShading;

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

BaseStandardMaterial.prototype.isMeshStandardMaterial = true;
BaseStandardMaterial.prototype.isShaderMaterial = true;

export { BaseStandardMaterial };

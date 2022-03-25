import defaultVertex from './defaultVertex.glsl';
import defaultFragment from './defaultFragment.glsl';

import {
	Color,
	DataTexture,
	Material,
	RedFormat,
	ShaderLib,
	TangentSpaceNormalMap,
	Vector2,
} from 'three';
import baseUniforms from '@webgl/Materials/baseUniforms';

class BaseToonMaterial extends Material {
	static gradientMap;
	constructor(parameters) {
		if (!BaseToonMaterial.gradientMap) BaseToonMaterial.setGradientMap();
		super();

		this.defines = { TOON: '' };

		this.uniforms = {
			...ShaderLib.toon.uniforms,
			...parameters.uniforms,
			...baseUniforms,
		};

		this.type = 'ShaderMaterial';

		this.color = new Color(0xffffff);

		this.map = null;
		this.gradientMap = BaseToonMaterial.gradientMap;

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

		this.alphaMap = null;

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

		this.color.copy(source.color);

		this.map = source.map;
		this.gradientMap = source.gradientMap;

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

		this.alphaMap = source.alphaMap;

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

	static setGradientMap() {
		const colors = new Uint8Array(5 + 2);

		for (let c = 0; c <= colors.length; c++) {
			colors[c] = (c / colors.length) * 256;
		}

		BaseToonMaterial.gradientMap = new DataTexture(colors, colors.length, 1, RedFormat);
		BaseToonMaterial.gradientMap.needsUpdate = true;
	}
}

BaseToonMaterial.prototype.isMeshToonMaterial = true;
BaseToonMaterial.prototype.isShaderMaterial = true;

export { BaseToonMaterial };

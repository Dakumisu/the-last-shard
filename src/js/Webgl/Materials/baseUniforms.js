import { ShaderChunk } from 'three';

export default {
	uTime: { value: 0 },
	uFogNearColor: { value: null },
	uFogFarColor: { value: null },
	uFogNoiseFreq: { value: 0 },
	uFogNoiseSpeed: { value: 0 },
	uFogNoiseAmount: { value: 0 },
	uFogHeightPropagation: { value: 4 },
	uFogHeightDensity: { value: 0.75 },
	uFogNear: { value: 30 },
	uFogFar: { value: 60 },
	uWindSpeed: { value: 0.15 },
};

// List of uniforms to add globally to pre-made Three.js material (not shader mat)
ShaderChunk.common += `
uniform float uTime;`;

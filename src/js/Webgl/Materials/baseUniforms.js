import { ShaderChunk } from 'three';

export default {
	uTime: { value: 0 },
	uFogNearColor: { value: null },
	uFogNoiseFreq: { value: 0 },
	uFogNoiseSpeed: { value: 0 },
	uFogNoiseImpact: { value: 0 },
	uFogNoiseAmount: { value: 0 },
	uWindSpeed: { value: 0.15 },
};

// List of uniforms to add globally to pre-made Three.js material (not shader mat)
ShaderChunk.common += `
uniform float uTime;`;

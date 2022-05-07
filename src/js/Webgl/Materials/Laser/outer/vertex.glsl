#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform float uTimeIntensity;

varying float vNoise;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vEye;

void main() {

// Global
	float time = -uTime * uTimeIntensity;

// Noise
	float noise = cnoise(position.xz * 20. + time * 10.);

// Edges elevation
	float smoothUvStart = 1.0 - smoothstep(0., 1.0, uv.y);
	float smoothUvEnd = 1.0 - smoothstep(0., 1.0, 1.0 - uv.y);
	float smoothUvEdges = smoothUvStart * smoothUvEnd;

// Render
	vec3 pos = position + normal * abs(noise) * 0.0175;
	pos.xy += normal.xy * 0.05;
	// pos += normal * smoothUvEdges * 0.25;

// Varying
	vNoise = noise;
	vUv = uv;
	vPos = position;
	vNormal = normalize(normalMatrix * normal);
	vEye = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

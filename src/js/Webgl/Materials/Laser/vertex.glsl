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

// Render
	vec3 pos = position + normal * abs(noise) * 0.035;

// Varying
	vNoise = noise;
	vUv = uv;
	vPos = position;
	vNormal = normalize(normalMatrix * normal);
	vEye = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

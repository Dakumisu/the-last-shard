#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform float uTimeIntensity;
uniform sampler2D uTexture;

varying float vNoise;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vEye;

void main() {

// Global
	float time = -uTime * uTimeIntensity;
	float noiseFactor = 1.5;
	float globalNoise = 0.7;

  // Uv repeat with noise
	vec2 uv = vUv;

	uv += uv;

	float noiseUvHigh = (cnoise(uv * noiseFactor + time));

	uv = fract(uv + noiseUvHigh * globalNoise + time);

  // Pos repeat with noise
	vec3 pos = vPos;

	pos.xz += uv;

	float noisePosHigh = (cnoise(pos.xz * noiseFactor + time));

	pos = fract(pos + noisePosHigh * globalNoise + time);

  // Inner
	vec3 innerColor = vec3(0.5, 0.5, 1.0);

  // Outside
	vec3 outsideColor = vec3(0.29, 0.3, 0.89);

  // Fresnel
	float a = (1.0 - -min(dot(vEye, normalize(vNormal)), 0.0));
	a += pow(a, 10.);

  // Alpha
	float aStart = 1.0 - smoothstep(noisePosHigh * noiseUvHigh, 1.0, uv.x);
	float aEnd = 1.0 - smoothstep(noisePosHigh * noiseUvHigh, 1.0, 1.0 - uv.x);
	float aMix = aStart * aEnd;
	float smoothUvStart = 1.0 - smoothstep(0., 1.0, vUv.y);
	float smoothUvEnd = 1.0 - smoothstep(0., 1.0, 1.0 - vUv.y);
	float smoothUvEdges = smoothUvStart * smoothUvEnd;

	gl_FragColor.xyz = vec3(a * noiseUvHigh * 0.2 * outsideColor / aMix * innerColor);
	gl_FragColor.a = 1.0 - (a / smoothUvEdges * aMix);
}

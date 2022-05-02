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
	float noiseFactor = 2.;
	float globalNoise = 0.35;

  // Uv repeat with noise
	vec2 uv = vUv;

	uv += uv;

	float noiseUv = (cnoise(uv * noiseFactor + time));
	float noiseUvHigh = (cnoise(uv * noiseFactor * 2. + time));

	uv = fract(uv + noiseUv * globalNoise + time);

	float textUv = texture2D(uTexture, uv).r;

  // Pos repeat with noise
	vec3 pos = vPos;

	pos.xz += uv;

	float noisePos = (cnoise(pos.xz * noiseFactor + time));
	float noisePosHigh = (cnoise(pos.xz * noiseFactor * 2. + time));

	pos = fract(pos + noisePosHigh * globalNoise + time);

	float textPos = texture2D(uTexture, pos.xz).r;

  // Inner
	float firstMix = mix(textPos, textUv, (noiseUv / noisePos));
	float lastMix = mix(textPos, textUv, (noiseUvHigh / noisePosHigh));
	float mixRender = (firstMix + lastMix);

	vec3 innerColor = vec3(0.5, 0.5, 1.0);
	vec3 innerRender = vec3(mixRender) * innerColor;

  // Outside
	vec3 outsideColor = vec3(0.29, 0.3, 0.89);
	vec3 outsideRender = vec3(abs(vNoise)) + outsideColor;

  // Fresnel
	float a = (1.0 - -min(dot(vEye, normalize(vNormal)), 0.0));

  // Rgb render
	vec3 render = mix(innerRender, outsideRender, a);

  // Alpha
	float smoothUvStart = 1.0 - smoothstep(noisePosHigh * noiseUvHigh, 1.0, uv).r;
	float smoothUvEnd = 1.0 - smoothstep(noisePosHigh * noiseUvHigh, 1.0, 1.0 - uv).r;
	float SmoothUv = smoothUvStart * smoothUvEnd;

	gl_FragColor = vec4(render, mixRender / a);
}

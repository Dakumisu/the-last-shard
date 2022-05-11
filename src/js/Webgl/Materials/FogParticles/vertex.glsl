#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;

attribute float aScale;
attribute float aOffset;
attribute vec3 aPositions;

varying vec2 vUv;
varying float vFade;
varying float vLoop;
varying float vNoise;

float N(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float smoothNoise(vec2 ip) {
	vec2 lv = fract(ip);
	vec2 id = floor(ip);

	lv = lv * lv * (3. - 2. * lv);

	float bl = N(id);
	float br = N(id + vec2(1, 0));
	float b = mix(bl, br, lv.x);

	float tl = N(id + vec2(0, 1));
	float tr = N(id + vec2(1, 1));
	float t = mix(tl, tr, lv.x);

	return mix(b, t, lv.y);
}

float map(float value, float start1, float stop1, float start2, float stop2) {
	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

void main() {
	float boxSize = uHalfBoxSize * 2.;
	float uHalfBoxSizeY = uHalfBoxSize * 0.1;
	float boxSizeY = uHalfBoxSizeY * 2.;

	float time = uTime * 0.00008 * aScale;

	vec3 pos = position * aScale;

	vec3 translation = vec3(0.);

	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;
	translation.y = uCharaPos.y - mod(aPositions.y + uCharaPos.y, boxSizeY) + uHalfBoxSizeY;

	float fade = 1.0 - smoothstep(0., 1., (0.1 * distance(uCharaPos, translation)));

	vFade = fade;
	vUv = uv;

	// Looping on Y axis
	float maxDuration = 5.;

	float noise = cnoise(aPositions.xz + time);
	float rotateNoise = cnoise(aPositions.xy);
	vNoise = rotateNoise;

	float loop = mod(time * aScale * maxDuration, maxDuration) / maxDuration;

	float loopRange = 4.5;

	translation.x += loop;
	translation.z -= loop;

	vLoop = loop;

    translation.x += noise;
    translation.z += noise;
    translation.y += noise;

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	mv.xyz += pos;

	gl_Position = projectionMatrix * mv;

}

#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;
uniform vec3 uCamPos;
uniform sampler2D uElevationTexture;
uniform sampler2D uGrassTexture;
uniform sampler2D uNoiseTexture;
uniform vec3 uMaxMapBounds;
uniform vec3 uMinMapBounds;

attribute float aScale;
attribute float aOffset;
attribute vec3 aPositions;

varying vec2 vUv;
varying float vFade;
varying float vFadePos;
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

	float time = uTime * 0.0001 * aScale;

	vec3 pos = position * aScale;

	vec3 translation = vec3(0.);

	translation.xz = uCamPos.xz - mod(aPositions.xz + uCamPos.xz, boxSize) + uHalfBoxSize;

	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

	float fade = 1.0 - smoothstep(0., 1., (0.05 * distance(uCamPos.xz, translation.xz)));

	vFadePos = fade;
	vUv = uv;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

	// float heightNoise = texture2D(uNoiseTexture, scaledCoords).r * 100.;
	// float heightNoiseSmall = texture2D(uNoiseTexture, scaledCoords).r * 50.;
	// pos *= (abs(heightNoise) + abs(heightNoiseSmall)) * 0.0;

	vFade = elevation;

	// float scaleFromTexture = 1. - texture2D(uGrassTexture, scaledCoords).g;
	// scaleFromTexture = smoothstep(1., .5, scaleFromTexture);
	// pos *= scaleFromTexture;

	// Apply height map
	float translationOffset = map(elevation, 1., 0., uMinMapBounds.y, uMaxMapBounds.y);
	translation.y += translationOffset;

	// Looping on Y axis
	float maxDuration = 5.;

	float noise = cnoise(aPositions.xz + time);
	vNoise = noise;

	float loop = mod(time * aScale * 0.6 * maxDuration, maxDuration) / maxDuration;
	vLoop = loop;

	float loopRange = 6.;

	translation.y += loop * loopRange - (loopRange * 0.35);
	translation.x += loop * loopRange - (loopRange * 0.35);

	translation.x += noise * aOffset * 0.5;
	translation.z += noise * aOffset * 0.5;

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	if(elevation >= 1.) {
		pos = vec3(0.);
	} else {
		mv.xyz += pos;
	}

	gl_Position = projectionMatrix * mv;

}

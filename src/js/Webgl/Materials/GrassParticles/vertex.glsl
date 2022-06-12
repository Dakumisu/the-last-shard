#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;
uniform sampler2D uElevationTexture;
uniform sampler2D uPositionTexture;
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

	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

	float fade = 1.0 - smoothstep(0., 1., (0.075 * distance(uCharaPos.xz, translation.xz)));

	vFadePos = fade;
	vUv = uv;

	// Scale down out of range grass
	float scaleFromRange = smoothstep(uHalfBoxSize, uHalfBoxSize - uHalfBoxSize * .5, distance(uCharaPos.xz, translation.xz));
	// pos.y += scaleFromRange;
	// pos *= scaleFromRange;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

	vFade = elevation;

	// float scaleFromTexture = 1. - texture2D(uPositionTexture, vec2(scaledCoords.x, 1. - scaledCoords.y)).r;
	// scaleFromTexture = smoothstep(1., .5, scaleFromTexture);
	// pos *= scaleFromTexture;

	translation.y += pos.y * 0.5;

	// Apply height map
	float translationOffset = map(elevation, 1., 0., uMinMapBounds.y, uMaxMapBounds.y);
	translation.y += translationOffset;

	// Player trail
	float trailIntensity = smoothstep(1.8, 0., distance(uCharaPos, translation.xyz));
	vec3 trailDirection = normalize(uCharaPos.xyz - translation.xyz);

	float heightNoise = cnoise(translation.xz * 0.4);
	float heightNoiseSmall = cnoise(translation.xz * 0.2);
	translation.y += (abs(heightNoise) + abs(heightNoiseSmall)) * 0.25;

	// Looping on Y axis
	float maxDuration = 1.0;

	float loop = mod(time * 1.5 * aScale * maxDuration, maxDuration) / maxDuration;
	vLoop = loop;
	
	float loopRange = 0.75;

	// translation.y += loop * loopRange - 1.0;
	translation.y += 0.3;

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	if(elevation >= 1.) {
		pos = vec3(0.);
	} else {
		mv.xz += pos.xz;
		mv.y += pos.y * 0.5;
	}

	gl_Position = projectionMatrix * mv;

}

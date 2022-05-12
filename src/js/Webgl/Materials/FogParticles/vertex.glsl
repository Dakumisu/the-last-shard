// #pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

// uniform float uTime;
// uniform float uHalfBoxSize;
// uniform vec3 uCharaPos;
// uniform sampler2D uElevationTexture;
// uniform sampler2D uPositionTexture;
// uniform vec3 uMaxMapBounds;
// uniform vec3 uMinMapBounds;

// attribute float aScale;
// attribute float aOffset;
// attribute vec3 aPositions;

// varying vec2 vUv;
// varying float vFade;
// varying float vLoop;
// varying float vNoise;

// float N(vec2 st) {
// 	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
// }

// float smoothNoise(vec2 ip) {
// 	vec2 lv = fract(ip);
// 	vec2 id = floor(ip);

// 	lv = lv * lv * (3. - 2. * lv);

// 	float bl = N(id);
// 	float br = N(id + vec2(1, 0));
// 	float b = mix(bl, br, lv.x);

// 	float tl = N(id + vec2(0, 1));
// 	float tr = N(id + vec2(1, 1));
// 	float t = mix(tl, tr, lv.x);

// 	return mix(b, t, lv.y);
// }

// float map(float value, float start1, float stop1, float start2, float stop2) {
// 	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
// }

// void main() {
// 	float boxSize = uHalfBoxSize * 2.;
// 	float uHalfBoxSizeY = uHalfBoxSize * 0.1;
// 	float boxSizeY = uHalfBoxSizeY * 2.;

// 	float time = uTime * 0.00008 * aScale;

// 	vec3 pos = position * aScale;


// 	vec3 translation = vec3(0.);

// 	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;
// 	translation.y = uCharaPos.y - mod(aPositions.y + uCharaPos.y, boxSizeY) + uHalfBoxSizeY;

// 	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
// 	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

// 	float fade = 1.0 - smoothstep(0., 1., (0.1 * distance(uCharaPos, translation)));

// 	vFade = fade;
// 	vUv = uv;


// 	// Map position to the elevation texture coordinates using the map bounds
// 	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
// 	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

// 	// float scaleFromTexture = 1. - texture2D(uPositionTexture, vec2(scaledCoords.x, 1. - scaledCoords.y)).r;
// 	// scaleFromTexture = smoothstep(1., .5, scaleFromTexture);
// 	// pos *= scaleFromTexture;


// 	// Player trail
// 	float trailIntensity = smoothstep(2.5, 0., distance(uCharaPos, translation.xyz));
// 	vec3 trailDirection = normalize(uCharaPos.xyz - translation.xyz);

// 	// Grass displacement according to player trail
// 	// translation -= trailIntensity * trailDirection;
// 	// pos += trailIntensity;


// 	// Looping on Y axis
// 	float maxDuration = 5.;

// 	float noise = cnoise(aPositions.xz + time);
// 	float rotateNoise = cnoise(aPositions.xy);
// 	vNoise = rotateNoise;

// 	float loop = mod(time * aScale * maxDuration, maxDuration) / maxDuration;

// 	float loopRange = 4.5;

// 	translation.x += loop;
// 	translation.z -= loop;

// 	vLoop = loop;

//     translation.x += noise * aScale;
//     translation.z += noise * aScale;
//     translation.y += noise * aScale;

// 	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

// 	mv.xyz += pos;

// 	gl_Position = projectionMatrix * mv;

// }



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
	float uHalfBoxSizeY = uHalfBoxSize * 0.05;
	float boxSizeY = uHalfBoxSizeY * 2.;

	float time = uTime * 0.00008 * aScale;

	vec3 pos = position * aScale;

	vec3 translation = vec3(0.);

	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

	float fade = 1.0 - smoothstep(0., 1., (0.05 * distance(uCharaPos, translation)));

	vFade = fade;
	vUv = uv;

	// Scale down out of range grass
	float scaleFromRange = smoothstep(uHalfBoxSize, uHalfBoxSize - uHalfBoxSize * .5, distance(uCharaPos.xz, translation.xz));
	pos.y += scaleFromRange;
	pos *= scaleFromRange;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

	// Apply height map
	float translationOffset = map(elevation, 1., 0., uMinMapBounds.y, uMaxMapBounds.y);
	translation.y += translationOffset;

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

    translation.x += noise * aScale;
    translation.z += noise * aScale;
    translation.y += noise * aScale;
	// translation.y += .5;

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	mv.xyz += pos;

	gl_Position = projectionMatrix * mv;

}


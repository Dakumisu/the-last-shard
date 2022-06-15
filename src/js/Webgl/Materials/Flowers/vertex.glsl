#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')
#pragma glslify: smoothNoise = require('philbin-packages/glsl/noises/smooth/2d')
#pragma glslify: map = require('philbin-packages/glsl/maths/map')

uniform float uTime;
uniform float uWindSpeed;
uniform float uDisplacement;
uniform float uNoiseMouvementIntensity;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;
uniform vec3 uCamPos;
uniform sampler2D uElevationTexture;
uniform sampler2D uGrassTexture;
uniform sampler2D uNoiseTexture;
uniform vec3 uMaxMapBounds;
uniform vec3 uMinMapBounds;

attribute float aScale;
attribute vec3 aPositions;
attribute vec4 aRotate;

varying float vFade;
varying float vFadePos;
varying float vNoiseMouvement;
varying vec2 vUv;
varying vec3 vPos;

#include <fog_pars_vertex>

void main() {
	float boxSize = uHalfBoxSize * 2.;
	float time = uTime * uWindSpeed * 0.002;

	vec3 pos = position * aScale;
	vec3 instancedPos = pos + aPositions;

	vPos = pos;
	vUv = uv;

	vec4 orientation = normalize(aRotate);
	vec3 vcV = cross(orientation.xyz, pos);
	pos = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + pos);

	vec3 translation = pos;

	translation.xz = uCamPos.xz - mod(aPositions.xz + uCamPos.xz, boxSize) + uHalfBoxSize;

	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

	float fade = 1.0 - smoothstep(0., 1., (0.085 * distance(uCamPos.xz, translation.xz)));

	vFadePos = fade;

	// Scale down out of range grass
	float scaleFromRange = smoothstep(uHalfBoxSize, uHalfBoxSize - uHalfBoxSize * 0.5, distance(uCamPos.xz, translation.xz));
	pos *= scaleFromRange;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

	float heightNoise = texture2D(uNoiseTexture, scaledCoords).r * 100.;
	float heightNoiseSmall = texture2D(uNoiseTexture, scaledCoords).r * 50.;
	pos *= (abs(heightNoise) + abs(heightNoiseSmall)) * 0.017;

	vFade = elevation;

	// if(elevation >= 1.) {
	// 	translation = vec3(0.);
	// }

	// float scaleFromTexture = 1. - texture2D(uGrassTexture, vec2(scaledCoords.x, 1. - scaledCoords.y)).r;
	// scaleFromTexture = smoothstep(1., .5, scaleFromTexture);
	// pos *= scaleFromTexture;

	translation.xz += pos.xz;
	translation.y += pos.y * 0.35;

	// Apply height map
	float translationOffset = map(elevation, 1., 0., uMinMapBounds.y, uMaxMapBounds.y);
	translation.y += translationOffset;

	// Player trail
	float trailIntensity = smoothstep(1.8, 0., distance(uCharaPos, translation.xyz));
	vec3 trailDirection = normalize(uCharaPos.xyz - translation.xyz);

	// Grass displacement according to player trail
	translation.x -= trailIntensity * trailDirection.x * 0.25;
	pos.y *= 1. - trailIntensity;
	translation.z -= trailIntensity * trailDirection.y * 0.25;

	vNoiseMouvement = cnoise(translation.xz * uNoiseMouvementIntensity * 20. + time * 2.);

	if(instancedPos.y > 0.) {
		translation.xz += vNoiseMouvement * uDisplacement;
	}

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	#ifdef USE_FOG
	vFogWorldPosition = translation;
	#endif

	gl_Position = projectionMatrix * mv;
}

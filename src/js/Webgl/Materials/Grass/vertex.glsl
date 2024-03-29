#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')
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

varying float vFade;
varying float vNoiseMouvement;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vGlobalPos;

#include <fog_pars_vertex>

void main() {
	float boxSize = uHalfBoxSize * 2.;
	float time = uTime * uWindSpeed * 0.002;

	vec3 pos = position * aScale;

	vec3 instancedPos = pos + aPositions;

	vec3 translation = vec3(pos.x, 0., pos.z);

	translation.xz = uCamPos.xz - mod(aPositions.xz + uCamPos.xz, boxSize) + uHalfBoxSize;

	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

	// Scale down out of range grass
	float scaleFromRange = smoothstep(uHalfBoxSize, uHalfBoxSize - uHalfBoxSize * .5, distance(uCamPos.xz, translation.xz));
	pos *= scaleFromRange;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

	vFade = elevation;
	vUv = uv;
	vNormal = normalize(normalMatrix * normal);

	float scaleFromTexture = 1. - texture2D(uGrassTexture, scaledCoords).g;
	scaleFromTexture = smoothstep(1., .5, scaleFromTexture);
	pos *= scaleFromTexture;

	float heightNoise = texture2D(uNoiseTexture, scaledCoords).r * 100.;
	float heightNoiseSmall = texture2D(uNoiseTexture, scaledCoords).r * 50.;
	pos *= (abs(heightNoise) + abs(heightNoiseSmall)) * 0.017;

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

	vNoiseMouvement = cnoise(translation.xz * uNoiseMouvementIntensity + time * 1.5);

	if(instancedPos.y > 0.) {
		translation.xz += vNoiseMouvement * uDisplacement;
	}

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	if(elevation >= 1.) {
		translation = vec3(0.);
	} else {
		mv.xyz += pos;
	}

	#ifdef USE_FOG
	vFogWorldPosition = translation;
	#endif

	gl_Position = projectionMatrix * mv;

	vPos = pos;
	vGlobalPos = translation;
}

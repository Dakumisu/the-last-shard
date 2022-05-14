#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')
#pragma glslify: smoothNoise = require('philbin-packages/glsl/noises/smooth/2d')
#pragma glslify: map = require('philbin-packages/glsl/maths/map')

uniform float uWindSpeed;
uniform float uDisplacement;
uniform float uNoiseMouvementIntensity;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;
uniform sampler2D uElevationTexture;
uniform sampler2D uGrassTexture;
uniform vec3 uMaxMapBounds;
uniform vec3 uMinMapBounds;

attribute float aScale;
attribute vec3 aPositions;
attribute vec4 aRotate;

varying float vFade;
varying float vNoiseMouvement;
varying vec2 vUv;
varying vec3 vPos;

#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
	float boxSize = uHalfBoxSize * 2.;
	float time = uTime * uWindSpeed * 0.002;

	vec3 pos = position * aScale;
	vec3 instancedPos = pos + aPositions;

	vPos = pos;
	vUv = uv;
	// vec3 rotatedPos = pos;

	vec4 orientation = normalize(aRotate);
	vec3 vcV = cross(orientation.xyz, pos);
	pos = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + pos);

	vec3 translation = pos;

	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

	// Scale down out of range grass
	float scaleFromRange = smoothstep(uHalfBoxSize, uHalfBoxSize - uHalfBoxSize * .5, distance(uCharaPos.xz, translation.xz));
	pos *= scaleFromRange;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

	vFade = elevation;

	if(elevation >= 1.) {
		pos = vec3(0.);
	}

	// float scaleFromTexture = 1. - texture2D(uGrassTexture, vec2(scaledCoords.x, 1. - scaledCoords.y)).r;
	// scaleFromTexture = smoothstep(1., .5, scaleFromTexture);
	// pos *= scaleFromTexture;
	translation.xz += pos.xz;

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

	vNoiseMouvement = cnoise(translation.xz * uNoiseMouvementIntensity * 20. + time);

	if(instancedPos.y > 0.) {
		translation.xz += vNoiseMouvement * uDisplacement;
	}

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = -mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>

	#ifdef USE_FOG
	vFogWorldPosition = translation;
	#endif

	gl_Position = projectionMatrix * mv;
}

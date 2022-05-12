#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')
#pragma glslify: smoothNoise = require('philbin-packages/glsl/noises/smooth/2d')
#pragma glslify: map = require('philbin-packages/glsl/maths/map')

uniform float uTime;
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

varying vec3 vPos;
varying float vFade;
varying float vNoiseMouvement;

vec4 quat_from_axis_angle(vec3 axis, float angle) {
	vec4 qr;
	float half_angle = (angle * 0.5) * 3.14159 / 180.0;
	qr.x = axis.x * sin(half_angle);
	qr.y = axis.y * sin(half_angle);
	qr.z = axis.z * sin(half_angle);
	qr.w = cos(half_angle);
	return qr;
}

vec4 quat_conj(vec4 q) {
	return vec4(-q.x, -q.y, -q.z, q.w);
}

vec4 quat_mult(vec4 q1, vec4 q2) {
	vec4 qr;
	qr.x = (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y);
	qr.y = (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x);
	qr.z = (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w);
	qr.w = (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z);
	return qr;
}

vec3 rotate(vec3 position, vec3 axis, float angle) {
	vec4 qr = quat_from_axis_angle(axis, angle);
	vec4 qr_conj = quat_conj(qr);
	vec4 q_pos = vec4(position.x, position.y, position.z, 0);

	vec4 q_tmp = quat_mult(qr, q_pos);
	qr = quat_mult(q_tmp, qr_conj);

	return vec3(qr.x, qr.y, qr.z);
}

void main() {
	float boxSize = uHalfBoxSize * 2.;
	float time = uTime * uWindSpeed * 0.002;

	vec3 pos = position * aScale;

	vPos = pos;

	vec3 translation = vec3(0., pos.y, 0.);
	vec3 rotation = rotate(pos, vec3(0., 1.0, 0.), time * 300.);

	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

	translation += rotation;
	// translation.xz += pos.xz;

	// Scale down out of range grass
	float scaleFromRange = smoothstep(uHalfBoxSize, uHalfBoxSize - uHalfBoxSize * .5, distance(uCharaPos.xz, translation.xz));
	// pos.y += scaleFromRange * .5;
	pos.y += scaleFromRange * .1;
	pos *= scaleFromRange;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

	vFade = elevation;

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

	// vNoiseMouvement = cnoise(translation.xz * uNoiseMouvementIntensity + time);

	// if(instancedPos.y > 0.) {
	// 	translation.xz += vNoiseMouvement * uDisplacement;
	// }

	// gl_Position = projectionMatrix * modelViewMatrix * vec4(new_x, new_y, p.z, 1.0);

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);
	// mv.xyz += pos;

	gl_Position = projectionMatrix * mv;
}

#define PI 3.14159265

uniform float uTime;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;

attribute vec3 aScale;
attribute vec3 aPositions;
attribute vec3 aTriggerPosition;
attribute vec3 aColor;

varying vec3 vPos;
varying vec3 vColor;
// varying vec3 vNormal;
varying vec2 vUv;
varying float vFade;

const float maxDuration = 10.;

void main() {

	vUv = uv;
	// vNormal = normal;
	vColor = aColor;

	vec3 pos = position * aScale;

	float time = -uTime * 0.4;

	vPos = pos + aPositions;
	vec3 triggerPos = pos + aTriggerPosition;

	float boxSize = uHalfBoxSize * 2.;

	vec3 translation = vec3(0., vPos.y, 0.);

	translation.xz = uCharaPos.xz - mod(vPos.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

	float fade = 1.0 - smoothstep(.25, .75, (.2 * distance(uCharaPos, translation))); // Sphere mask
	// float fade = 1.0 - step(1., (.075 * distance(uCharaPos, translation))); // Sphere mask

	vFade = fade;

	// vec4 mv = modelViewMatrix * vec4(translation, 1.0);
	vec4 mv = modelViewMatrix * vec4(aPositions, 1.0);
	mv.xyz += pos.xyz * (PI * 2.);
	gl_Position = projectionMatrix * mv;
}

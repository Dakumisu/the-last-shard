#define PI 3.14159265

uniform float uTime;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;
uniform vec3 vOffset;
uniform vec3 uBoxPosition;

varying vec3 vPos;
varying vec2 vUv;
// varying vec2 vOffset;
varying vec3 vNormal;
varying vec3 vTest;

attribute vec3 aPosition;
attribute vec3 aPositionMean;

float wave(float waveSize, float topDistance, float centerDistance) {
    // Tip is the fifth vertex drawn per blade
	bool isTop = (gl_VertexID + 1) % 3 == 0;

	float waveDistance = isTop ? topDistance : centerDistance;
	return sin((uTime * 0.0008) + waveSize) * waveDistance;
}

const float maxDuration = 20.;
const int brindille = 3;

void main() {
	vUv = uv;
	// vOffset = offset;
	vNormal = normalize(normalMatrix * normal);

	vec3 pos = position;
	vPos = pos + aPosition;

	vec3 posMean = position + aPositionMean;
	// vTest = posMean;

	// if(vPos.y < 0.0) {
	// 	vPos.y = 0.0;
	// } else {
	// 	vPos.x += wave(uv.x * 10.0, 0.3, 0.);
	// }

	// vec3 centerPos = uCharaPos * 2.;
	// vPos = brindillePos;

	// float loop = mod((uTime * 0.0015) - vOffset.x * maxDuration, maxDuration) / maxDuration;
	vec3 particlePos = vPos;

	float boxSize = uHalfBoxSize * 2.;

	// vec3 translation = vec3(0., vPos.y, 0.);
	// translation.xz = uCharaPos.xz - mod(posMean.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;
	// translation.xz -= vPos.xz;
	// // particlePos.z += (loop);

	vec3 translation = vec3(0., vPos.y, 0.);
	translation.xz = uCharaPos.xz - mod(vPos.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;
	// float fade = 1.0 - smoothstep(.25, .75, (.2 * distance(uCharaPos, translation))); // Sphere mask

	// vPos.y *= vPos.y;

	vec3 render = vPos;

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);
	mv.xyz += pos.xyz * (PI * 2.);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(render, 1.0);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(render, 1.0);
	gl_Position = projectionMatrix * mv;
}

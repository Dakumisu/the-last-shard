uniform float uTime;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;
uniform vec3 vOffset;
uniform vec3 uBoxPosition;

varying vec3 vPosition;
varying vec2 vUv;
// varying vec2 vOffset;
varying vec3 vNormal;
varying vec3 vTest;

attribute vec3 aPosition;
attribute vec3 aPositionMean;

float wave(float waveSize, float tipDistance, float centerDistance) {
    // Tip is the fifth vertex drawn per blade
	bool isTop = (gl_VertexID + 1) % 3 == 0;

	float waveDistance = isTop ? tipDistance : centerDistance;
	return sin((uTime / 500.0) + waveSize) * waveDistance;
}

const float maxDuration = 20.;
const int brindille = 3;

void main() {
	vUv = uv;
	// vOffset = offset;
	vNormal = normalize(normalMatrix * normal);
	vPosition = position + aPosition;

	vec3 posMean = position + aPositionMean;
	// vTest = posMean;

	// if(vPosition.y < 0.0) {
	// 	vPosition.y = 0.0;
	// } else {
	// 	vPosition.x += wave(uv.x * 10.0, 0.3, 0.1);
	// }

	// vec3 centerPos = uCharaPos * 2.;
	// vPosition = brindillePos;

	// float loop = mod((uTime * 0.0015) - vOffset.x * maxDuration, maxDuration) / maxDuration;
	vec3 particlePos = vPosition;

	float boxSize = uHalfBoxSize * 2.;

	vec3 translation = vec3(0., vPosition.y, 0.);
	translation.xz = uCharaPos.xz - mod(posMean.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;
	translation.xz -= vPosition.xz;
	// particlePos.z += (loop);

	// vPosition.y *= vPosition.y;

	vec3 render = vPosition + uCharaPos;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(translation, 1.0);
}

uniform float uTime;

attribute vec3 aPositions;
attribute vec3 aColor;

varying vec3 vPos;
varying vec3 vColor;
varying vec2 vUv;

const float maxDuration = 10.;

void main() {

	vUv = uv;
	vPos = position;
	vColor = aColor;

	vec3 pos = position;

	// float offset = aOffset;

	float time = -uTime * 0.4;

	// float loop = mod(time - (aOffset) * maxDuration, maxDuration) / maxDuration;
	vec3 particlePos = pos + aPositions;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(particlePos, 1.0);
}

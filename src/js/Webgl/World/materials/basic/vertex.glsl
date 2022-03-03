precision highp float;

#define PI 3.1415926535897932384626433832795

varying vec2 vUv;

void main() {
	vUv = uv;
	vec3 pos = position;

	vec4 mv = modelViewMatrix * vec4(pos, 1.);
	gl_Position = projectionMatrix * mv;
}

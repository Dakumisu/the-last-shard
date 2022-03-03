precision highp float;

#define PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uAlpha;
uniform vec3 uColor;
uniform vec3 uResolution;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	float time = uTime * .001;

	vec3 color = vec3(uColor);

	gl_FragColor = vec4(uv, 0., uAlpha);
}

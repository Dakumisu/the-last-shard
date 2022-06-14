varying vec2 vUv;

uniform float uAlpha;

void main() {
	vec2 uv = vUv;

	vec4 render = vec4(uv, 0.0, uAlpha);

	gl_FragColor = render;
}

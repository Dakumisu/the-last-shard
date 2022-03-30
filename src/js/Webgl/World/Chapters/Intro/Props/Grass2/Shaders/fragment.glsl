varying float vFade;
varying vec2 vUv;
varying vec3 vPos;
uniform float uTime;

vec3 blue = vec3(0., 0.5, 0.9);

void main() {
	vec3 color = mix(blue * 0.5, blue, vPos.y * 3.);

	float mask = 1.0 - smoothstep(0., 0.75, vUv.y);

	gl_FragColor = vec4(vPos, 1.0);
	gl_FragColor = vec4(color, mask);
	gl_FragColor = vec4(color, vFade);
	gl_FragColor = vec4(color, 1.0);
}

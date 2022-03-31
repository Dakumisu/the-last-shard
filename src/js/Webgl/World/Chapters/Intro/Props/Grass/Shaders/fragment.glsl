varying float vFade;
varying vec3 vPos;
varying float vNoiseMouvement;
varying float vNoiseElevation;

vec3 blue = vec3(0., 0.5, 0.9);

void main() {
	vec3 color = mix(blue * 0.3, blue, vPos.y * 2.);

	gl_FragColor = vec4(vec3(color + vNoiseMouvement * 0.2), vFade * vNoiseElevation);
}

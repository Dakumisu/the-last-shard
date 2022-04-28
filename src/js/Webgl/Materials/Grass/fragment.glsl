varying float vFade;
varying float vNoiseMouvement;
varying vec3 vPos;

uniform float uWindColorIntensity;
uniform vec3 uColor;

void main() {
	vec3 color = mix(uColor * 0.3, uColor, vPos.y * 2.);

	vec3 render = color + vNoiseMouvement * uWindColorIntensity;

	if(vFade == 1.)
		discard;

	gl_FragColor = vec4(render, 1.);

}

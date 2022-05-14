uniform float uTime;
varying float vFade;
varying float vNoiseMouvement;
varying vec3 vPos;

uniform float uWindColorIntensity;
uniform vec3 uColor;
uniform vec3 uColor2;

#include <fog_pars_fragment>

void main() {
	float noiseElevation = vNoiseMouvement * uWindColorIntensity;
	vec3 color = mix(uColor2, uColor, vPos.y);

	vec3 render = color + noiseElevation;

	if(vFade == 1.)
		discard;

	gl_FragColor = vec4(render, 1.);

	#include <fog_fragment>

}

varying float vFade;
varying float vNoiseMouvement;
varying vec2 vUv;
varying vec3 vPos;

uniform float uTime;
uniform float uWindColorIntensity;
uniform sampler2D uTexture;

#include <fog_pars_fragment>

void main() {
	float noiseElevation = vNoiseMouvement * uWindColorIntensity;

	vec4 text = texture2D(uTexture, vUv);

	vec4 render = text;
	render.rgb += noiseElevation;

	if(vFade == 1.)
		discard;

	gl_FragColor = render;

	if(gl_FragColor.a <= .5) {
		discard;
	}

	#include <fog_fragment>

	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

varying float vFade;
varying float vNoiseMouvement;
varying vec2 vUv;
varying vec3 vPos;

uniform float uTime;
uniform float uWindColorIntensity;
uniform vec3 uColor;
uniform vec3 uColor2;
uniform sampler2D uTexture;

#include <fog_pars_fragment>

void main() {
	float noiseElevation = vNoiseMouvement * uWindColorIntensity;

	vec4 text = texture2D(uTexture, vUv);

	vec4 render = text;

	if(vFade == 1.)
		discard;

	gl_FragColor = render;

	#include <fog_fragment>

	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

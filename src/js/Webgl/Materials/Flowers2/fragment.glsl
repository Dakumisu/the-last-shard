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

	float text = texture2D(uTexture, vUv).r;
	vec4 textu = texture2D(uTexture, vUv);

	vec3 color = mix(uColor2, uColor, vPos.y);
	color += vec3(text);

	vec3 render = color + noiseElevation;

	if(vFade == 1.)
		discard;

	gl_FragColor = vec4(render, 1.);

	#include <fog_fragment>

	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

varying float vFade;
varying float vFadePos;
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

  //Get colour data from texture
	vec4 text = vec4(texture2D(uTexture, vUv));
//   text.rgb += uColor;
//   text.rgb *= mix(uColor * 0.5, uColor2 * 1.3, vPos.y);
	text.rgb += mix(uColor * 0.3, uColor2, vPos.y * noiseElevation);

	gl_FragColor = text;
	gl_FragColor.a *= vFadePos;

	if(vFade == 1.)
		discard;

	if(gl_FragColor.a <= .05) {
		discard;
	}

	#include <fog_fragment>

	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

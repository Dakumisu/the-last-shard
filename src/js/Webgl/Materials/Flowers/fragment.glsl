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

  //Get colour data from texture
  vec4 text = vec4(texture2D(uTexture, vUv));
//   text.rgb += uColor;
//   text.rgb *= mix(uColor * 0.5, uColor2 * 1.3, vPos.y);
  text.rgb += mix(uColor, uColor2, vPos.y) * 0.6;


  gl_FragColor = text;

	if(vFade == 1.)
		discard;

	if(gl_FragColor.a <= .05) {
		discard;
	}

  gl_FragColor = text;

	#include <fog_fragment>

	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

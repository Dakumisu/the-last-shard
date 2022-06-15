uniform float uTime;
uniform float uWindColorIntensity;
uniform vec3 uColor;
uniform vec3 uColor2;

varying float vFade;
varying float vNoiseMouvement;
varying vec2 vUv;
varying vec3 vPos;

uniform sampler2D uGrass;

uniform sampler2D uDiffuse;
uniform sampler2D uAlpha;

#include <fog_pars_fragment>

void main() {

//Get transparency information from alpha map
  // float alpha = texture2D(uAlpha, vUv).r;
  //If transparent, don't draw
  // if(alpha < 0.15){
  //   discard;
  // }

	float noiseElevation = vNoiseMouvement * uWindColorIntensity;

  //Get colour data from texture
	vec4 text = vec4(texture2D(uDiffuse, vUv));
	float textR = text.r;

	text.rgb += uColor2;
	text.rgb *= mix(uColor * 0.3, uColor2, vPos.y);

	gl_FragColor = text;
	gl_FragColor = vec4(textR) + vec4(mix(uColor * 0.5, uColor2, vPos.y) * uColor2, 1.0);
	gl_FragColor = vec4(mix(uColor2, uColor, vPos.y * 0.8 + textR * 0.5 + noiseElevation), 1.0);

	#include <fog_fragment>

}

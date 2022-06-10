uniform float uTime;
uniform float uWindColorIntensity;
uniform vec3 uColor;
uniform vec3 uColor2;

varying float vFade;
varying float vNoiseMouvement;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

uniform sampler2D uGrass;

uniform sampler2D uDiffuse;
uniform sampler2D uAlpha;

#include <fog_pars_fragment>

void main() {
	float noiseElevation = vNoiseMouvement * uWindColorIntensity;
	vec3 color = mix(uColor2, uColor, vPos.y);

	vec3 render = color + noiseElevation;

	// if(vFade == 1.)
	// 	discard;

	// gl_FragColor = vec4(render, 1.);

//Get transparency information from alpha map
  float alpha = texture2D(uAlpha, vUv).r;
  //If transparent, don't draw
  if(alpha < 0.1){
    discard;
  }
  //Get colour data from texture
  vec4 col = vec4(texture2D(uDiffuse, vUv));
  col.rgb *= uColor;
  col.rgb = mix(col.rgb, uColor, vPos.y);

  gl_FragColor = col;

	#include <fog_fragment>

}

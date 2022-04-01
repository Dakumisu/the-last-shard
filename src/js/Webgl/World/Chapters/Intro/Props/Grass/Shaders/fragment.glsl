varying float vFade;
varying float vNoiseMouvement;
varying float vNoiseElevation;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

uniform float uWindColorIntensity;
uniform vec3 uColor;
uniform vec3 uFogColor;
uniform sampler2D uNoiseTexture;

void main() {
	vec3 color = mix(uColor * 0.3, uColor, vPos.y * 2.);

	vec3 render = mix(uFogColor, color + vNoiseMouvement * uWindColorIntensity, vFade);

	gl_FragColor = vec4(render, vNoiseElevation);
	gl_FragColor = vec4(render, 1.0);

}

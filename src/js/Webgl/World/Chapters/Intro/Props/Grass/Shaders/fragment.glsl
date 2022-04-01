varying float vFade;
varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;
varying float vNoiseMouvement;
varying float vNoiseElevation;
uniform sampler2D uNoiseTexture;

vec3 blue = vec3(0., 0.5, 0.9);

void main() {
	vec3 color = mix(blue * 0.3, blue, vPos.y * 2.);

	float texture = texture2D(uNoiseTexture, vPos.yz).r;

	gl_FragColor = vec4(vec3(color + vNoiseMouvement * 0.2), vFade);
	gl_FragColor = vec4(vec3(color + vNoiseMouvement * 0.2), 1.0);
	gl_FragColor = vec4(vPos, 1.0);
	// gl_FragColor = texture;
	gl_FragColor = vec4(texture);
	gl_FragColor = vec4(vNormal, 1.);
	gl_FragColor = vec4(vec3(color + vNoiseMouvement * 0.2), vFade * vNoiseElevation);
}

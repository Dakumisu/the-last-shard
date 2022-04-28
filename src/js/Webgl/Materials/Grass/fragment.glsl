varying float vFade;
varying float vNoiseMouvement;
varying vec3 vPos;

uniform float uWindColorIntensity;
uniform vec3 uColor;
// uniform vec3 uFogColor;

void main() {
	vec3 color = mix(uColor * 0.3, uColor, vPos.y * 2.);

	// vec3 render = mix(uFogColor, color + vNoiseMouvement * uWindColorIntensity, vFade);
	vec3 render = color + vNoiseMouvement * uWindColorIntensity;

	// gl_FragColor = vec4(render, vNoiseElevation);
	// gl_FragColor = texture2D(uElevationTexture, vUv);

	// if(vFade == .0)
	// 	discard;

	// gl_FragColor = vec4(render, vFade);
	gl_FragColor = vec4(render, 1.);

	// gl_FragColor = vec4(vec3(1. - vElevationTest, 0., 0.), 1.0);
}

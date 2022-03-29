// uniform sampler2D uCloud;

uniform vec3 uCharaPos;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vTest;

vec3 green = vec3(0., 0.5, 0.9);

void main() {
	vec3 color = mix(green * 0.5, green, vPosition.y);
	// color = mix(color, texture2D(uCloud, vUv).rgb, 0.4);

	float lighting = normalize(dot(vNormal, vec3(1.0)));
	// gl_FragColor = vec4(uCharaPos, 1.0);
	gl_FragColor = vec4(color + lighting * 0.01, 1.0);
	gl_FragColor = vec4(vPosition, 1.0);
	gl_FragColor = vec4((color) + lighting * 0.025, 1.0);
	// gl_FragColor = vec4(vTest, 1.);
}

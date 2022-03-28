// uniform sampler2D uCloud;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

vec3 green = vec3(0., 0.7, 0.9);

void main() {
	vec3 color = mix(green * 0.7, green, vPosition.y);
	// color = mix(color, texture2D(uCloud, vUv).rgb, 0.4);

	float lighting = normalize(dot(vNormal, vec3(10)));
	gl_FragColor = vec4((color * vec3(vUv, 1.0)) + lighting * 0.01, 1.0);
}

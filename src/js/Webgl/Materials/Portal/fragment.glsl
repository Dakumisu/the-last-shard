uniform vec3 uColor;
uniform vec3 uColor2;
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
	vec4 text = texture2D(uTexture, vUv);
	gl_FragColor = vec4(vUv, vUv);
	gl_FragColor = vec4(vUv, 1.0, 1.0);
	gl_FragColor = text;
}

precision highp float;
varying vec3 vPos;
void main() {
	gl_FragColor = vec4(normalize(vPos), 1.);
}
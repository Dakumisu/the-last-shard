uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTransition;

varying vec2 vUv;

void main() {

	gl_FragColor = vec4(mix(uColor1, uColor2, uTransition), .5);
}

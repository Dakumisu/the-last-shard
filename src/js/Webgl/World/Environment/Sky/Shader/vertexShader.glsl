varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vTextUv;

void main() {
	vUv = uv * 50.;
	vTextUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	vPosition = position;
}

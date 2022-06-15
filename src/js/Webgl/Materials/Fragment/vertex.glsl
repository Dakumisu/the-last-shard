varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEye;

void main() {
	vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	vNormal = normalize(normalMatrix * normal);
	vEye = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
}

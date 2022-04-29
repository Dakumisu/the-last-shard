uniform float uTime;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

void main() {
	vec3 pos = position;
	// pos.x += sin(uTime * pos.y * .1) * 0.05;
	// pos.y += sin(uTime * pos.z * .05) * 0.05;
	// pos.z += sin(uTime * pos.z * .1) * 0.05;
	vUv = uv;
	vPos = position;
	vNormal = normal;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
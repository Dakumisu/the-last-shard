uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

void main() {

	vec3 newPos = position;
	newPos.x += sin(uTime * newPos.y * 50.) * 0.0035;
	newPos.y += sin(uTime * newPos.z * 50.) * 0.0035;
	newPos.z += sin(uTime * newPos.z * 50.) * 0.0035;
	vUv = uv;
	vPos = position;
	vNormal = normal;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
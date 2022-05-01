uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

void main() {

	float time = -uTime * 0.00025;

	// newPos.x += sin(uTime * newPos.y * 50.) * 0.0035;
	// newPos.y += sin(uTime * newPos.z * 50.) * 0.0035;
	// newPos.z += sin(uTime * newPos.z * 50.) * 0.0035;

	vec2 newUv = uv;
	newUv += newUv;
	newUv = fract(newUv + time);

	float textUv = texture2D(uTexture, position.xz + time).r;

	vec3 newPos = position;

	newPos.xz += uv;
	newPos = fract(newPos + time);
	float textPos = texture2D(uTexture, newPos.xz).r;

	vec3 fPos = position;

	fPos += normal * textPos;

	vUv = uv;
	vPos = position;
	vNormal = normal;


	
	gl_Position = projectionMatrix * modelViewMatrix * vec4(fPos, 1.0);
}
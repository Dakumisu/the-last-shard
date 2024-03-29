vec2 rotate(vec2 uv, float rotation, vec2 mid) {
	return vec2(cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x, cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y);
}

uniform float uTime;
uniform float uProgress;
uniform sampler2D uShard;
uniform sampler2D uShard2;
uniform sampler2D uMask;
uniform sampler2D uNoise;

varying vec3 vNormal;
varying vec3 vEye;
varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	uv += uv;
	uv = fract(uv + uTime * 0.00085);

	vec4 mask = texture2D(uMask, vUv);

	vec2 rotatedUv = rotate(vUv, uTime * 0.001 + mask.b, vec2(0.5));

		// Fresnel
	float a = (1.0 - -min(dot(vEye, normalize(vNormal)), 0.0));

	vec3 shard = texture2D(uShard, rotatedUv).rgb;

	vec3 shard2 = texture2D(uShard2, rotatedUv).rgb;

	// vec3 render = shard * shard2;
	vec3 render = mix(shard, shard2, a);

	float alphaT = 1.0;
	float alphaF = 0.;

	float noise = texture2D(uNoise, vUv).g;

	float temp = uProgress;
	temp += ((10.0 * noise - 9.) * 0.02);

	float distanceFromCenter = length(vUv - 0.5);
	temp = smoothstep(temp - 0.05, temp, distanceFromCenter);

	vec4 finalRender = mix(vec4(render + a * 0.5, 1.0), vec4((render + a) * 300., 0.), temp);

	// gl_FragColor = shard;
	// gl_FragColor = shard2;
	gl_FragColor = finalRender;
}

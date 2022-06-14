varying vec2 vUv;

uniform float uAlpha;
uniform sampler2D uNoise;
uniform sampler2D uMap;

void main() {
	vec2 uv = vUv;

	vec2 uvDisolve = uv * .5;
	uvDisolve = step(.4, uvDisolve);
	vec4 noise = texture2D(uNoise, uvDisolve);
	vec4 render = vec4(uv, 0.0, uAlpha);
	vec4 map = texture2D(uMap, uv);

	vec4 fragmentDisvoled = mix(render, noise, 1.);

	float alpha = uAlpha;

	gl_FragColor = vec4(map.xyz, alpha);
}

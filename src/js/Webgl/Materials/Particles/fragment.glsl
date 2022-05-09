varying float vFade;
varying float vLoop;
varying vec2 vUv;
uniform vec3 uColor;
uniform vec3 uColor2;
varying float vNoise;

void main() {
	float distanceToCenter = distance(vUv, vec2(0.5));
	float strength = 0.0075 / distanceToCenter;

	float smoothEnd = smoothstep(0.0, 0.1, 1.0 - vLoop);
	float smoothStart = smoothstep(0.0, 0.1, vLoop);
	float globalSmooth = smoothStart * smoothEnd;

	vec3 render = mix(uColor, uColor2, vNoise);

	gl_FragColor = vec4(render, strength * vFade * globalSmooth );
}

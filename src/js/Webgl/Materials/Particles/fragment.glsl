varying float vFadePos;
varying float vFade;
varying float vLoop;
varying vec2 vUv;
uniform vec3 uColor;
uniform vec3 uColor2;
varying float vNoise;

void main() {
	float distanceToCenter = distance(vUv, vec2(0.5));
	float strength = 0.006 / distanceToCenter;

	float smoothEnd = smoothstep(0.0, 0.2, 1.0 - vLoop);
	float smoothStart = smoothstep(0.0, 1.0, vLoop);
	float globalSmooth = smoothStart * smoothEnd;

	if(vFade == 1.)
		discard;

	vec3 render = mix(uColor, uColor2, vNoise * 2.);

	gl_FragColor = vec4(render, strength * vFadePos * globalSmooth);
}

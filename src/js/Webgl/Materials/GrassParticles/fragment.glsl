uniform vec3 uColor;
uniform vec3 uColor2;

varying vec2 vUv;
varying float vFadePos;
varying float vFade;
varying float vLoop;
varying float vRandomColor;

void main() {
	float distanceToCenter = distance(vUv, vec2(0.5));
	float strength = 0.0017 / distanceToCenter;

	float smoothEnd = smoothstep(0.0, 0.5, 1.0 - vLoop);
	float smoothStart = smoothstep(0.0, 0.5, vLoop);
	float globalSmooth = smoothStart * smoothEnd;

	if(vFade == 1.)
		discard;

	vec3 render = mix(uColor, uColor2, vRandomColor);

	gl_FragColor = vec4(render, strength * vFadePos * globalSmooth);
}

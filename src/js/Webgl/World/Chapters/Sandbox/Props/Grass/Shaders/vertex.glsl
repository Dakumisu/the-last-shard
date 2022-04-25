#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform float uSpeed;
uniform float uMaskRange;
uniform float uDisplacement;
uniform float uNoiseMouvementIntensity;
uniform float uNoiseElevationIntensity;
uniform float uElevationIntensity;
uniform float uHalfBoxSize;
uniform vec3 uCharaPos;
uniform sampler2D uNoiseTexture;

attribute vec3 aScale;
attribute vec3 aPositions;

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;
varying float vFade;
varying float vNoiseMouvement;
varying float vNoiseElevation;

float N(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float smoothNoise(vec2 ip) {
	vec2 lv = fract(ip);
	vec2 id = floor(ip);

	lv = lv * lv * (3. - 2. * lv);

	float bl = N(id);
	float br = N(id + vec2(1, 0));
	float b = mix(bl, br, lv.x);

	float tl = N(id + vec2(0, 1));
	float tr = N(id + vec2(1, 1));
	float t = mix(tl, tr, lv.x);

	return mix(b, t, lv.y);
}

void main() {
	float time = uTime * uSpeed * 0.002;

	vec3 pos = position * aScale;

	float displacement = texture2D(uNoiseTexture, uv).r * 100.;

	vUv = uv;

	vPos = pos;
	vNormal = normal;

	float boxSize = uHalfBoxSize * 2.;

	vec3 translation = vec3(0., pos.y, 0.);

	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

	vNoiseMouvement = cnoise(translation.xz * uNoiseMouvementIntensity + time);
	vNoiseElevation = smoothstep(0.2, .8, smoothNoise(translation.xz * uNoiseElevationIntensity));

	if(translation.y < 0.) {
		translation.y = 0.;
	} else {
		translation.xz += vNoiseMouvement * uDisplacement;
	}

	float fade = 1.0 - smoothstep(0., 1., (uMaskRange * distance(uCharaPos.xz, translation.xz)));

	vFade = fade;

	pos.y += fade * vNoiseElevation * uElevationIntensity;

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);
	mv.xyz += pos.xyz;
	gl_Position = projectionMatrix * mv;

}

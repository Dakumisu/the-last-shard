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
uniform sampler2D uElevationTexture;
uniform sampler2D uGrassTexture;
uniform vec3 uMaxMapBounds;
uniform vec3 uMinMapBounds;

attribute vec3 aScale;
attribute vec3 aPositions;

varying vec3 vPos;
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

float map(float value, float start1, float stop1, float start2, float stop2) {
	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

void main() {
	float time = uTime * uSpeed * 0.002;
	float boxSize = uHalfBoxSize * 2.;

	vec3 pos = position * aScale;

	vPos = pos;

	vec3 translation = vec3(0., 0., 0.);

	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, .0, 1.), map(-translation.z, uMinMapBounds.z, uMaxMapBounds.z, .0, 1.));

	float scaleFromTexture = texture2D(uGrassTexture, scaledCoords).r;
	pos *= 1. - scaleFromTexture;

	float elevation = texture2D(uElevationTexture, scaledCoords).r;

	vNoiseMouvement = cnoise(translation.xz * uNoiseMouvementIntensity + time);
	vNoiseElevation = smoothstep(0.2, .8, smoothNoise(translation.xz * uNoiseElevationIntensity));

	// if(translation.y < 0.) {
	// 	translation.y = 0.;
	// } else {
	// translation.xz += vNoiseMouvement * uDisplacement;
	// }

	translation.xz += vNoiseMouvement * uDisplacement;

	float fade = 1.0 - smoothstep(0., 1., (uMaskRange * distance(uCharaPos.xz, translation.xz)));

	vFade = fade;

	pos.y += fade * vNoiseElevation * uElevationIntensity;

	// pos.y *= vGrassPresent;
	// pos.y += map(elevation, 0., 1., -50., 50.);
	// pos.y += elevation;

	// Apply height map
	float translationOffset = map(elevation, 1., 0., uMinMapBounds.y, uMaxMapBounds.y);
	translation.y += translationOffset;

	// Player trail
	float trailIntensity = mix(0.0, .5, smoothstep(2.5, 0., distance(uCharaPos, translation.xyz)));
	vec2 trailDirection = normalize(uCharaPos.xz - translation.xz);

	// Grass displacement according to player trail
	translation.x -= trailIntensity * trailDirection.x * .7;
	pos.y *= 1. - trailIntensity;
	translation.z -= trailIntensity * trailDirection.y * .7;

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	mv.xyz += pos.xyz;

	gl_Position = projectionMatrix * mv;

}

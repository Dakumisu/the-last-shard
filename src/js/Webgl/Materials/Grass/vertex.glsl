#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform float uWindSpeed;
uniform float uDisplacement;
uniform float uNoiseMouvementIntensity;
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
	float boxSize = uHalfBoxSize * 2.;
	float time = uTime * uWindSpeed * 0.002;

	vec3 pos = position * aScale;

	vec3 instancedPos = pos + aPositions;

	vPos = pos;

	vec3 translation = vec3(0.);

	translation.xz = uCharaPos.xz - mod(aPositions.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

	translation.x = clamp(translation.x, uMinMapBounds.x, uMaxMapBounds.x);
	translation.z = clamp(translation.z, uMinMapBounds.z, uMaxMapBounds.z);

	// Scale down out of range grass
	float scaleFromRange = smoothstep(uHalfBoxSize, uHalfBoxSize - uHalfBoxSize * .5, distance(uCharaPos.xz, translation.xz));
	pos.y += scaleFromRange * .35;
	pos *= scaleFromRange;

	// Map position to the elevation texture coordinates using the map bounds
	vec2 scaledCoords = vec2(map(translation.x, uMinMapBounds.x, uMaxMapBounds.x, 0., 1.), map(translation.z, uMaxMapBounds.z, uMinMapBounds.z, .0, 1.));
	float elevation = texture2D(uElevationTexture, scaledCoords.xy).r;

	vFade = elevation;

	float scaleFromTexture = 1. - texture2D(uGrassTexture, scaledCoords).r;
	scaleFromTexture = smoothstep(1., .5, scaleFromTexture);
	pos *= scaleFromTexture;

	// Apply height map
	float translationOffset = map(elevation, 1., 0., uMinMapBounds.y, uMaxMapBounds.y);
	translation.y += translationOffset;

	// Player trail
	float trailIntensity = smoothstep(2.5, 0., distance(uCharaPos, translation.xyz));
	vec3 trailDirection = normalize(uCharaPos.xyz - translation.xyz);

	// Grass displacement according to player trail
	translation.x -= trailIntensity * trailDirection.x * .7;
	pos.y *= 1. - trailIntensity;
	translation.z -= trailIntensity * trailDirection.y * .7;

	// pos *= scaleFromTexture;
	// translation.y *= scaleFromTexture;

	vNoiseMouvement = cnoise(translation.xz * uNoiseMouvementIntensity + time);

	// vNoiseElevation = smoothstep(0.2, .8, smoothNoise(translation.xz * uNoiseElevationIntensity));

	if(instancedPos.y > 0.) {
		translation.xz += vNoiseMouvement * uDisplacement;
	}

	// translation.xz += vNoiseMouvement * uDisplacement;

	// float fade = 1.0 - smoothstep(0., 1., (uMaskRange * distance(uCharaPos, translation.xyz)));

	// vFade = fade;

	// pos.y += fade * vNoiseElevation * uElevationIntensity;

	// pos.y *= vGrassPresent;
	// pos.y += map(elevation, 0., 1., -50., 50.);
	// pos.y += elevation;

	// translation.y *= uElevationIntensity;

	vec4 mv = modelViewMatrix * vec4(translation, 1.0);

	// mv.xyz += pos.xyz;
	mv.xyz += pos;

	gl_Position = projectionMatrix * mv;

}

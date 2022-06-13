uniform float uTimeIntensity;
uniform sampler2D uTexture;

varying float vNoise;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vEye;

uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4(diffuse, opacity);
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
	#ifdef USE_LIGHTMAP

	vec4 lightMapTexel = texture2D(lightMap, vUv2);
	reflectedLight.indirectDiffuse += lightMapTexelToLinear(lightMapTexel).rgb * lightMapIntensity;
	#else
	reflectedLight.indirectDiffuse += vec3(1.0);
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	gl_FragColor = vec4(outgoingLight, diffuseColor.a);

// Global
	float time = -uTime * uTimeIntensity;
	float noiseFactor = 1.5;
	float globalNoise = 0.7;

  // Uv repeat with noise
	vec2 uv = vUv;

	uv += uv;

	float noiseUvHigh = (cnoise(uv * noiseFactor + time));

	uv = fract(uv + noiseUvHigh * globalNoise + time);

  // Pos repeat with noise
	vec3 pos = vPos;

	pos.xz += uv;

	float noisePosHigh = (cnoise(pos.xz * noiseFactor + time));

	pos = fract(pos + noisePosHigh * globalNoise + time);

  // Inner
	vec3 innerColor = vec3(0.5, 0.5, 1.0);

  // Outside
	vec3 outsideColor = vec3(1.0, 0.5, 1.0);

  // Fresnel
	float a = (1.0 - -min(dot(vEye, normalize(vNormal)), 0.0));
	a += pow(a, 10.);

  // Alpha
	float aStart = 1.0 - smoothstep(noisePosHigh * noiseUvHigh, 1.0, uv.x);
	float aEnd = 1.0 - smoothstep(noisePosHigh * noiseUvHigh, 1.0, 1.0 - uv.x);
	float aMix = aStart * aEnd;
	float smoothUvStart = 1.0 - smoothstep(0., 1.0, vUv.y);
	float smoothUvEnd = 1.0 - smoothstep(0., 1.0, 1.0 - vUv.y);
	float smoothUvEdges = smoothUvStart * smoothUvEnd;

	gl_FragColor.xyz *= vec3(outsideColor + noisePosHigh + noiseUvHigh);
	gl_FragColor.a *= (smoothUvEdges / a);

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

uniform float opacity;
uniform float uTransition;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 diffuse;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEye;
varying vec3 vPos;

float random(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

#ifndef FLAT_SHADED
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

	// Fresnel
	float a = (1.0 - -min(dot(vEye, normalize(vNormal)), 0.0));

	gl_FragColor = vec4(outgoingLight, diffuseColor.a);

	vec2 uv = vUv;
	uv = fract(uv - uTime * 0.00015);
	float tNoise = cnoise(vUv * 10. + uTime * 0.00015);

	float oT = mod(uv.y * 5. + tNoise * 0.25, 1.0);

	float outline = (step(0.75, oT));

	float smoothTop = smoothstep(-0.25, 0., vPos.y);
	float smoothBottom = 1.0 - smoothstep(-0.2, 0.35, vPos.y);

	float smoothUv = 1.0 - smoothstep(0.5, .8, vPos.z);

	float render = smoothTop * smoothBottom * outline * tNoise * smoothUv * 6.;
	float render2 = smoothTop * smoothBottom * outline * tNoise * smoothUv * 12.;

	vec4 r1 = vec4(render) * vec4(uColor1, 1.0);
	vec4 r2 = vec4(render2) * vec4(uColor2, 1.0) * 0.75;

	vec4 finalRender = mix(r2, r1 * 5., uTransition);

	gl_FragColor *= finalRender;

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

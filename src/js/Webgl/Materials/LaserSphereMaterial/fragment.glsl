vec2 rotate(vec2 uv, float rotation, vec2 mid) {
	return vec2(cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x, cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y);
}

uniform float uTransition;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;

varying vec3 vNormal;
varying vec3 vEye;
varying vec2 vUv;

uniform vec3 diffuse;
uniform float opacity;
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
	gl_FragColor = vec4(outgoingLight, diffuseColor.a);

	vec2 uv = vUv;
	uv += uv;
	uv = fract(uv + uTime * 0.0005);

	vec4 textMask = texture2D(uTexture, uv);

	vec2 rotatedUv = rotate(uv, uTime * 0.001 + (textMask.r), vec2(0.5));
	vec3 text1 = texture2D(uTexture2, rotatedUv).rgb;
	vec3 text2 = texture2D(uTexture, rotatedUv).rgb;

	// text1 *= uColor1;

	// Fresnel
	float a = (1.0 - -min(dot(vEye, normalize(vNormal)), 0.0));

	// vec3 render = vec3(1.0 - a) * uColor2;
	vec3 render = uColor2 * 0.2 * vec3(a);
	vec3 render2 = (text2 / vec3(text1.b) * 0.5) + a;

	vec3 finalRender = mix(render, render2, uTransition);

	gl_FragColor.rgb *= finalRender;

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

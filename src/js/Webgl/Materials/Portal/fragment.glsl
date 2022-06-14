vec2 rotate(vec2 uv, float rotation, vec2 mid) {
	return vec2(cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x, cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y);
}

uniform vec3 uColor;
uniform vec3 uColor2;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform sampler2D uTextureMask;

varying vec2 vUv;

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

	vec4 textMask = texture2D(uTextureMask, vUv);

	float dist = length(vUv - 0.5);
	vec2 rotatedUv = rotate(vUv, uTime * 0.00075 + (textMask.b), vec2(0.5));

	vec3 text1 = texture2D(uTexture, rotatedUv).rgb;
	vec3 text2 = texture2D(uTexture2, rotatedUv).rgb;

	float smoothDist = smoothstep(0., 0.35, dist);

	text1 *= uColor;
	text2 *= uColor2;

	vec3 render = (text1 + text2) * smoothDist;
	render *= text1.b + text2.b;

	gl_FragColor.rgb *= render;

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

varying float vFade;
varying float vNoiseMouvement;
varying vec2 vUv;
varying vec3 vPos;

uniform float uWindColorIntensity;
uniform vec3 uColor;
uniform vec3 uColor2;
uniform sampler2D uTexture;

#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {
	float noiseElevation = vNoiseMouvement * uWindColorIntensity;

	float text = texture2D(uTexture, vUv).r;
	vec4 textu = texture2D(uTexture, vUv);

	vec3 color = mix(uColor2, uColor, vPos.y);
	color += vec3(text);

	vec3 render = color + noiseElevation;

	if(vFade == 1.)
		discard;

	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4(diffuse, opacity);
	ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>

	gl_FragColor = vec4(render, 1.);

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	// #include <fog_fragment>

#ifdef USE_FOG
	vec3 windDir = vec3(uTime, uTime, uTime);
	vec3 scrollingPos = vFogWorldPosition.xyz + uFogNoiseSpeed * windDir;
	float noise = cnoise(uFogNoiseFreq * scrollingPos.xz);
	float vFogDepth = (1.0 - uFogNoiseImpact * noise) * fogDepth;
	float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

	gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(uFogNearColor, fogColor, fogFactor), fogFactor);

	float uHeightPropagation = 4.;
	float uFogHeightDensity = 2.;

	float fogHeightFactor = max(0.0, vFogWorldPosition.y * uHeightPropagation + noise);
	fogHeightFactor = exp2(-fogHeightFactor * fogHeightFactor);

	gl_FragColor.rgb *= mix(gl_FragColor.rgb, uFogNearColor, fogHeightFactor * uFogHeightDensity);
#endif

	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}

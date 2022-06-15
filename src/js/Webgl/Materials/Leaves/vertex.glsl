
#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d');

#define TOON
varying vec3 vViewPosition;
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUv;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>

	vUv = uv;

	float time = uTime * 0.001;

	#ifdef USE_FOG
	vFogWorldPosition = transformed;
	#endif

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = -mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

	// position.y += 0.1;

	float noise = cnoise(position.xy * 20. + uTime * 0.0006);

	vec3 newPos = position + noise * 0.1;

	vPositionW = vec3(vec4(transformed, 1.0) * modelMatrix);
	vNormalW = normalize(vec3(vec4(normal, 0.0) * modelMatrix));

	gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

}

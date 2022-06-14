#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTimeIntensity;

varying float vNoise;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vEye;

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <skinbase_vertex>
	#ifdef USE_ENVMAP
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>

// Global
	float time = -uTime * uTimeIntensity;

// Noise
	float noise = cnoise(position.xz * 20. + time * 10.);

// Edges elevation
	float smoothUvStart = 1.0 - smoothstep(0., 1.0, uv.y);
	float smoothUvEnd = 1.0 - smoothstep(0., 1.0, 1.0 - uv.y);
	float smoothUvEdges = smoothUvStart * smoothUvEnd;

// Render
	vec3 pos = position + normal * (noise) * 0.06;

// Varying
	vNoise = noise;
	vUv = uv;
	vPos = position;
	vNormal = normalize(normalMatrix * normal);
	vEye = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

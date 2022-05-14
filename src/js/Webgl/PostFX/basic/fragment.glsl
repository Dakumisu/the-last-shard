precision highp float;

// #pragma glslify: filmic = require(philbin-packages/glsl/filters/simpleReinhard.glsl)
// #pragma glslify: linearToneMapping = require(philbin-packages/glsl/filters/whitePreservingLumaBasedReinhard.glsl)

#ifdef FXAA
	#pragma glslify: fxaa = require(philbin-packages/glsl/fxaa/index.glsl)
#endif

uniform float POST_PROCESSING;

uniform float uBrightness;
uniform float uContrast;

uniform sampler2D uScene;
uniform vec3 uResolution;

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution.xy;
	uv /= uResolution.z;

	vec3 render = vec3(0., 0., 0.);

	#ifdef FXAA
	render = fxaa(uScene, gl_FragCoord.xy / uResolution.z, uResolution.xy).rgb;
	#else
	render = texture2D(uScene, uv).rgb;
	#endif

	// POST PROCESSING
	float dist = smoothstep(0., 1.0, 1.0 - (length(uv - 0.5) * 1.));
	vec3 postPro = render;

	gl_FragColor = vec4(vec3(dist), 1.0);
	gl_FragColor = vec4(postPro * vec3(dist), 1.0);
	gl_FragColor = vec4(postPro * vec3(dist), 1.0);
	gl_FragColor.rgb += uBrightness;

	if(uContrast > 0.0) {
		gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - uContrast) + 0.5;
	} else {
		gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + uContrast) + 0.5;
	}
}

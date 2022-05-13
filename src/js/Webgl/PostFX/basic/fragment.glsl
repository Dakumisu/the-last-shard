precision highp float;
precision highp sampler2D;

uniform sampler2D uScene;
uniform vec3 uResolution;

uniform float lutSize;
uniform sampler2D lut;
uniform float intensity;

vec3 lutLookup(sampler2D tex, float size, vec3 rgb) {

	float sliceHeight = 1.0 / size;
	float yPixelHeight = 1.0 / (size * size);

	// Get the slices on either side of the sample
	float slice = rgb.b * size;
	float interp = fract(slice);
	float slice0 = slice - interp;
	float centeredInterp = interp - 0.5;

	float slice1 = slice0 + sign(centeredInterp);

	// Pull y sample in by half a pixel in each direction to avoid color
	// bleeding from adjacent slices.
	float greenOffset = clamp(rgb.g * sliceHeight, yPixelHeight * 0.5, sliceHeight - yPixelHeight * 0.5);

	vec2 uv0 = vec2(rgb.r, slice0 * sliceHeight + greenOffset);
	vec2 uv1 = vec2(rgb.r, slice1 * sliceHeight + greenOffset);

	vec3 sample0 = texture2D(tex, uv0).rgb;
	vec3 sample1 = texture2D(tex, uv1).rgb;

	return mix(sample0, sample1, abs(centeredInterp));

}

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution.xy;
	uv /= uResolution.z;

	vec4 val = texture2D(uScene, uv);
	vec4 lutVal;

	// pull the sample in by half a pixel so the sample begins
	// at the center of the edge pixels.
	float pixelWidth = 1.0 / lutSize;
	float halfPixelWidth = 0.5 / lutSize;
	vec3 uvw = vec3(halfPixelWidth) + val.rgb * (1.0 - pixelWidth);

	lutVal = vec4(lutLookup(lut, lutSize, uvw), val.a);
	lutVal = vec4(lutLookup(lut, lutSize, uvw), val.a);

	gl_FragColor = vec4(mix(val, lutVal, intensity));

}
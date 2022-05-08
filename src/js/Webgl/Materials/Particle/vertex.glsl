uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
uniform float uHalfBoxSize;
varying float vFade;
uniform vec3 uCharaPos;
attribute float aScale;
void main() {

    float boxSize = uHalfBoxSize * 2.;

    vec3 translation = vec3(0., position.y, 0.);

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    translation.xz = uCharaPos.xz - mod(modelPosition.xz + uCharaPos.xz, boxSize) + uHalfBoxSize;

    float fade = 1.0 - smoothstep(0., 1., (0.05 * distance(uCharaPos.xz, translation.xz)));

    vFade = fade;

    gl_Position = projectionMatrix * viewMatrix * vec4(translation, 1.0);
    gl_PointSize = uSize * aScale * uPixelRatio;
}

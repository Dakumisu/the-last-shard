
varying float vFade;

void main() {
    vec3 render = mix(vec3(0.5), vec3(1.0), vFade);
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.035 / distanceToCenter - 0.1;
    gl_FragColor = vec4(render, strength * vFade);
}

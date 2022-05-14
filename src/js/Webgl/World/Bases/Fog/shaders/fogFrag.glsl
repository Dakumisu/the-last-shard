#ifdef USE_FOG

// Far fog
vec3 windDir = vec3(uTime, uTime, uTime);
vec3 scrollingPos = vFogWorldPosition.xyz + uFogNoiseSpeed * windDir;
float noise = cnoise(uFogNoiseFreq * scrollingPos.xz);
// float vFogDepth = (1.0 - noise) * vFogDepth;
// float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
float fogFactor = smoothstep(0., 100., vFogDepth);

gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(uFogNearColor, fogColor, fogFactor), fogFactor);


// Ground fog
float uHeightPropagation = 5.0;
float uFogHeightDensity = 1.0;

float fogHeightFactor = max(0.0, vFogWorldPosition.y * uHeightPropagation + noise);
fogHeightFactor = exp2(- fogHeightFactor * fogHeightFactor);

gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogNearColor, fogHeightFactor * uFogHeightDensity);

#endif

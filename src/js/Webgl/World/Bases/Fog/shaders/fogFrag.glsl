#ifdef USE_FOG
vec3 windDir = vec3(uTime, uTime, uTime);
vec3 scrollingPos = vFogWorldPosition.xyz + uFogNoiseSpeed * windDir;
float noise = cnoise(uFogNoiseFreq * scrollingPos.xz);
float vFogDepth = (1.0 - uFogNoiseImpact * noise) * fogDepth;
float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(uFogNearColor, fogColor, fogFactor), fogFactor);

float uHeightPropagation = 0.3;
float uFogHeightDensity = 2.;

float fogHeightFactor = max(0.0, vFogWorldPosition.y * uHeightPropagation + noise);
fogHeightFactor = exp2(- fogHeightFactor * fogHeightFactor);

gl_FragColor.rgb *= mix(gl_FragColor.rgb, uFogNearColor, fogHeightFactor * uFogHeightDensity);
#endif

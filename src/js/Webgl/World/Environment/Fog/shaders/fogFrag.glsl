#ifdef USE_FOG
vec3 windDir = vec3(-uTime, uTime, uTime);
vec3 scrollingPos = vFogWorldPosition.xyz + uFogNoiseSpeed * windDir;
float noise = cnoise(uFogNoiseFreq * scrollingPos);
float vFogDepth = (1.0 - uFogNoiseImpact * noise) * fogDepth;
float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(uFogNearColor, fogColor, fogFactor),fogFactor);
#endif

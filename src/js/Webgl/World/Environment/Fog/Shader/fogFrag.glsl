#ifdef USE_FOG
vec3 windDir = vec3(-time, time, time);
vec3 scrollingPos = vFogWorldPosition.xyz + fogNoiseSpeed * windDir;
float noise = cnoise(fogNoiseFreq * scrollingPos.zx);
float vFogDepth = (1.0 - fogNoiseImpact * noise) * fogDepth;
float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

gl_FragColor.a = (1. - fogFactor);

gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(fogNearColor, fogColor, fogFactor), (fogFactor + noise * fogNoiseAmount));
#endif

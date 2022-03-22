#ifdef USE_FOG
vec3 windDir = vec3(-time, time, time);
vec3 scrollingPos = vFogWorldPosition.xyz + fogNoiseSpeed * windDir;
float noise = cnoise(fogNoiseFreq * scrollingPos.xyz);
float vFogDepth = (1.0 - fogNoiseImpact * noise) * fogDepth;
  #ifdef FOG_EXP2
float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
  #else
float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
  #endif
gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(fogNearColor, fogColor, fogFactor), fogFactor);
#endif

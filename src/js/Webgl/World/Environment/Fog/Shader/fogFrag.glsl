#ifdef USE_FOG
vec3 windDir = vec3(-time, time, time);
vec3 scrollingPos = vFogWorldPosition.xyz + fogNoiseSpeed * windDir;
float noise = cnoise(fogNoiseFreq * scrollingPos.zx);
float vFogDepth = (1.0 - fogNoiseImpact * noise) * fogDepth;
float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

// float fogHeightFactor = max(0.0, vFogWorldPosition.y * uHeightPropagation + uFogOffset);
float fogHeightFactor = sin((vFogWorldPosition.y + vFogWorldPosition.z) * 0.05 + time * 0.0125);

// gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(fogNearColor, fogColor, fogFactor), fogFactor + noise * fogNoiseAmount);
gl_FragColor.a = (1. - fogFactor);

// gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(fogNearColor, fogColor, fogFactor), (fogFactor + noise * fogNoiseAmount) + fogHeightFactor * 0.3);
gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(fogNearColor, fogColor, fogFactor), (fogFactor + noise * fogNoiseAmount));
// mix(gl_FragColor.rgb, uFogColor, fogHeightFactor * uFogHeightDensity);
#endif

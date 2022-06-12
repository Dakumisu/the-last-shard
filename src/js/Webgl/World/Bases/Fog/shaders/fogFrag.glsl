#ifdef USE_FOG

// Far fog
vec3 windDir = vec3(uTime, uTime, uTime);
vec3 scrollingPos = vFogWorldPosition.xyz + uFogNoiseSpeed * windDir;
float noise = cnoise(uFogNoiseFreq * scrollingPos.xz);
float fogFactor = smoothstep(uFogNear, uFogFar, vFogDepth);

vec3 farFog = mix(gl_FragColor.rgb, mix(uFogNearColor, uFogFarColor, fogFactor), fogFactor);


// Ground fog

float fogHeightFactor = max(0.0, vFogWorldPosition.y * uFogHeightPropagation + noise);
fogHeightFactor = exp2(- fogHeightFactor * fogHeightFactor);

vec3 heightFog = mix(gl_FragColor.rgb, uFogNearColor, fogHeightFactor * uFogHeightDensity);

vec3 r = mix(heightFog, farFog, fogFactor);
gl_FragColor.rgb = r;


#endif

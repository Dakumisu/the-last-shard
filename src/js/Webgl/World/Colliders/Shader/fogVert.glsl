#ifdef USE_FOG
fogDepth = - mvPosition.z;
vFogWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif

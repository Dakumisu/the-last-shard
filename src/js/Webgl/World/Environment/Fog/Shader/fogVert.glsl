#ifdef USE_FOG
fogDepth = - mvPosition.z + 20.;
vFogWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif

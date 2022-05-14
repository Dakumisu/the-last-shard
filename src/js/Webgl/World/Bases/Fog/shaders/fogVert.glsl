#ifdef USE_FOG
// fogDepth = - mvPosition.z;
fogDepth = mvPosition.y;
vFogWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
#endif

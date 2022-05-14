#ifdef USE_FOG
vFogDepth = - mvPosition.z;

fogDepth = mvPosition.y;
vFogWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
#endif

// #ifdef USE_FOG
// 	vFogDepth = - mvPosition.z;
// #endif

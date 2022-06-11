#ifdef USE_FOG
vFogDepth = - mvPosition.z;
vFogHeight = - mvPosition.y;

fogDepth = mvPosition.y;
vFogWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
#endif

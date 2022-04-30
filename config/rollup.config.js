export default {
	output: {
		dir: 'dist',
		format: 'es',
		manualChunks: {
			three: ['three'],
		},
	},
	treeshake: {
		// moduleSideEffects: false,
		tryCatchDeoptimization: true,
		propertyReadSideEffects: true,
		unknownGlobalSideEffects: true,
	},
};

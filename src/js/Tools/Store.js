const store = {
	resolution: {
		width: window.innerWidth,
		height: window.innerHeight,
		dpr: window.devicePixelRatio,
	},
	aspect: {
		ratio: window.innerWidth / window.innerHeight,

		a1: 0,
		a2: 0,
	},

	style: null,

	device: {
		isMobile: null,

		os: {
			name: '',
			version: null,
		},
	},
	browser: null,
	views: null,

	loadedAssets: {
		models: new Map(),
		audios: new Map(),
		textures: new Map(),
	},
};

export { store };

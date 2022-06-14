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

	quality: 5,
	isWebGL2: true,

	manifest: [],
	loadedAssets: {
		models: new Map(),
		audios: new Map(),
		textures: new Map(),
	},

	game: {
		isPaused: false,

		player: {
			canMove: true,
			canInteract: true,
		},

		fragmentsCollected: 0,

		levelsComplete: {
			Tuto: false,
			FloatingIsland: false,
			Faille: false,
		},
	},
};

export { store };

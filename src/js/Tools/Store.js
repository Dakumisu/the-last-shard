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

	manifest: [],
	loadedAssets: {
		models: new Map(),
		audios: new Map(),
		textures: new Map(),
	},

	webgl: {
		isWebGL2: true,
		quality: 5,
	},

	game: {
		isPaused: false,

		player: {
			canMove: true,
			canInteract: true,
		},

		currentScene: null,

		fragmentsCollected: 0,

		levelsComplete: {
			Tuto: false,
			FloatingIsland: false,
			Faille: false,
		},
	},
};

export { store };

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Uniforms',
	tab: 'Env',
};
import { getWebgl } from '@webgl/Webgl.js';
/// #endif

import SceneController from '@webgl/Scene/Controller.js';
import IntroScene from './Chapters/Intro/IntroScene.js';
import EndScene from './Chapters/End/EndScene.js';
import { initPlayer } from './Characters/Player.js';
import CabaneScene from './Chapters/Cabane/CabaneScene.js';
import baseUniforms from '@webgl/Materials/baseUniforms.js';

export default class World {
	constructor() {
		this.sceneController = new SceneController();

		this.init();

		/// #if DEBUG
		if (!debug.instance) {
			debug.instance = getWebgl().debug;
			this.setDebug();
		}
		/// #endif
	}

	/// #if DEBUG
	setDebug() {
		debug.instance.setFolder(debug.label, debug.tab, true);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(baseUniforms.uWindSpeed, 'value', { label: 'windSpeed' });

		// add other global uniforms here
	}
	/// #endif

	async init() {
		await this.setPlayer();
		await this.initScenes();
	}

	async initScenes() {
		// Wait first scene preload before starting other scenes preloading
		const introScene = new IntroScene();
		await introScene.preload();
		this.sceneController.add(introScene, true);

		const endScene = new EndScene();
		endScene.preload();
		this.sceneController.add(endScene);

		const cabaneScene = new CabaneScene();
		cabaneScene.preload();
		this.sceneController.add(cabaneScene);
	}

	async setPlayer() {
		this.player = initPlayer();
	}

	resize() {
		// if (this.player) this.player.resize();
	}

	update(et, dt) {
		if (this.sceneController) this.sceneController.update(et, dt);
		// if (this.sky) this.sky.update(et, dt);
		if (this.player) this.player.update(et, dt);
	}
}

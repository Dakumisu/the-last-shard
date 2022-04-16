import SceneController from '@webgl/Scene/Controller.js';
import IntroScene from './Chapters/Intro/Scene.js';
import EndScene from './Chapters/End/Scene.js';
import { initPlayer } from './Characters/Player.js';
import CabaneScene from './Chapters/Cabane/Scene.js';

export default class World {
	constructor() {
		this.sceneController = new SceneController();

		this.init();
	}

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

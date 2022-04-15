import SceneController from '@webgl/Scene/Controller.js';
import IntroScene from './Chapters/Intro/Scene.js';
import EndScene from './Chapters/End/Scene.js';
import { initPlayer } from './Characters/Player.js';
import { getGame } from '@game/Game.js';
import CabaneScene from './Chapters/Cabane/Scene.js';

export default class World {
	constructor() {
		this.sceneController = new SceneController();

		this.init();
	}

	async init() {
		await this.setPlayer();
		this.initScenes();
	}

	async initScenes() {
		const introScene = new IntroScene();
		introScene.preload();

		const endScene = new EndScene();
		endScene.preload();

		const cabaneScene = new CabaneScene();
		cabaneScene.preload();

		this.sceneController.add(introScene, true);
		this.sceneController.add(endScene);
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

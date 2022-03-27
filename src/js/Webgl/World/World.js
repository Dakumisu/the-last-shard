import SceneController from '@webgl/Scene/Controller.js';
import IntroScene from './Chapters/Intro/Scene.js';
import EndScene from './Chapters/End/Scene.js';

export default class World {
	constructor() {
		this.sceneController = new SceneController();
		this.initScenes();
	}

	async initScenes() {
		const introScene = new IntroScene();
		// await introScene.init();

		const testScene1 = new EndScene();
		// await testScene1.init();

		this.sceneController.add(introScene, true);
		this.sceneController.add(testScene1);
	}

	resize() {
		// if (this.player) this.player.resize();
	}

	update(et, dt) {
		if (this.sceneController) this.sceneController.update(et, dt);
		// if (this.sky) this.sky.update(et, dt);
	}
}

import SceneController from './Controller';
import BaseScene from './BaseScene';
import IntroScene from './IntroScene/IntroScene';
import TestScene from './TestScene/TestScene';

export default class Scenes {
	constructor() {
		this.sceneController = new SceneController();

		this.initScenes();
	}

	initScenes() {
		const introScene = new IntroScene();
		const testScene1 = new TestScene();

		this.sceneController.add(introScene, true);
		this.sceneController.add(testScene1);
	}
}

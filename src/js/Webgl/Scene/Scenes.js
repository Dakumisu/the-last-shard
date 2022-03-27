import SceneController from './Controller';
import IntroScene from '../World/Chapters/Intro/Scene';
import TestScene from '../World/Chapters/End/Scene';

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

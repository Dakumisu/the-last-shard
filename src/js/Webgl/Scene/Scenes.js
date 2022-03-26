import SceneController from './Controller';
import BaseScene from './Scenes/BaseScene';
import IntroScene from './Scenes/IntroScene';

export default class Scenes {
	constructor() {
		this.sceneController = new SceneController();

		this.initScenes();
	}

	initScenes() {
		const introScene = new IntroScene();
		const testScene1 = new BaseScene({ label: 'Level 1' });
		const testScene2 = new BaseScene({ label: 'Level 2' });

		this.sceneController.add(introScene, true);
		this.sceneController.add(testScene1);
		this.sceneController.add(testScene2);
	}
}

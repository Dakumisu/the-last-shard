import BaseScene from './BaseScene';

export default class IntroScene extends BaseScene {
	constructor() {
		super({ label: 'IntroScene' });
	}

	initScene(player, currentCamera) {
		super.initScene(player, currentCamera);
		console.log('Custom init : ', this.label);
	}
}

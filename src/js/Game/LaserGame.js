import BaseScene from '@webgl/Scene/BaseScene';

export default class LaserGame {
	/**
	 *
	 * @param {{scene: BaseScene, yOffset?: number}} param0
	 */
	constructor({ scene }) {
		this.laserTowers = [];
		this.scene = scene;
	}

	endEvent() {
		this.laserTowers.forEach((tower) => {
			tower.base.isInteractable = false;
		});
		console.log('🕹 Game ended');
	}
}

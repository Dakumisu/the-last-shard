import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { Color, Mesh, SphereGeometry } from 'three';
import BaseScene from '../BaseScene';

export default class TestScene extends BaseScene {
	constructor() {
		super({ label: 'TestScene' });

		this.initScene();
	}

	async initScene(player, currentCamera) {
		super.initScene(player, currentCamera);

		const material = new BaseToonMaterial({
			color: new Color('blue'),
		});
		const geometry = new SphereGeometry(20, 16, 16);
		const plane = new Mesh(geometry, material);

		this.instance.add(plane);
		// console.log('Custom init : ', this.label);
	}

	update(et, dt) {
		super.update(et, dt);
		// if (this.ground) this.ground.update(et, dt);
		// if (this.player) this.player.update(et, dt);
	}
}

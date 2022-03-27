import Player from '@webgl/World/Characters/Player';
import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Lights from './Environment/Lights/Lights';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { Color, Mesh, SphereGeometry } from 'three';

export default class EndScene extends BaseScene {
	constructor() {
		super({ label: 'EndScene' });

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
	}

	update(et, dt) {
		super.update(et, dt);
		// if (this.ground) this.ground.update(et, dt);
		// if (this.player) this.player.update(et, dt);
	}
}

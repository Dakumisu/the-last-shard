import Player from '@webgl/World/Characters/Player';
import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Lights from './Environment/Lights/Lights';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { BoxGeometry, Color, Mesh, PlaneGeometry, SphereGeometry } from 'three';

export default class EndScene extends BaseScene {
	constructor() {
		super({ label: 'EndScene' });

		this.initScene();
	}

	async initScene(player, currentCamera) {
		super.initScene(player, currentCamera);

		this.lights = new Lights(this);

		const material = new BaseToonMaterial({
			color: new Color('blue'),
		});
		const geometry = new PlaneGeometry(200, 200);
		geometry.rotateX(-Math.PI * 0.5);
		const plane = new Mesh(geometry, material);

		const cubeGeo = new BoxGeometry(10, 10, 10);
		const cube = new Mesh(cubeGeo, material);

		plane.position.y = -5;

		this.instance.add(plane, cube);
	}

	update(et, dt) {
		super.update(et, dt);
		// if (this.ground) this.ground.update(et, dt);
		// if (this.player) this.player.update(et, dt);
	}
}

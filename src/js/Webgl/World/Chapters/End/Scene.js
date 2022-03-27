import Player from '@webgl/World/Characters/Player';
import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Lights from './Environment/Lights/Lights';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { BoxGeometry, Color, Mesh, PlaneGeometry, SphereGeometry } from 'three';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture } from '@utils/loaders/loadAssets';

export default class EndScene extends BaseScene {
	constructor() {
		super({ label: 'EndScene' });
	}

	async init(player, currentCamera) {
		super.init(player, currentCamera);

		this.fog = new BaseFog({
			fogNearColor: '#ff0000',
			fogFarColor: '#ffff00',
			fogNear: 0,
			fogFar: 140,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await loadCubeTexture('envMap2'),
			/// #if DEBUG
			gui: this.gui,
			/// #endif
		});

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

	async addTo(mainScene) {
		super.addTo(mainScene);
		this.fog.set();
	}
}

import { getPlayer } from '@webgl/World/Characters/Player';
import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Lights from './Environment/Lights/Lights';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { BoxGeometry, Color, Matrix4, Mesh, PlaneGeometry, SphereGeometry, Vector3 } from 'three';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture } from '@utils/loaders/loadAssets';

export default class CabaneScene extends BaseScene {
	constructor() {
		super({ label: 'Cabane' });
	}

	async init(currentCamera) {
		super.init(currentCamera);

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

		console.log('switch');
		this.lights = new Lights(this);

		this.ground = new Ground(this);
		await this.ground.init();

		this.player = getPlayer();

		this.resetPlayer();
	}

	resetPlayer() {
		this.player.setStartPosition(new Vector3(0, 10, 0));

		this.ground.base.mesh.updateWorldMatrix(true, false);
		const mat4 = new Matrix4();
		mat4.multiplyMatrices(this.ground.base.mesh.matrixWorld, this.ground.base.mesh.matrix);
		this.ground.base.geometry.matrixWorld = this.ground.base.mesh.matrixWorld;

		this.player.setCollider(this.ground.base.geometry);
	}

	update(et, dt) {
		super.update(et, dt);
		// if (this.ground) this.ground.update(et, dt);
		if (this.player) this.player.update(et, dt);
	}

	async addTo(mainScene) {
		super.addTo(mainScene);
		this.fog.set();
	}
}

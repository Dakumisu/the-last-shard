import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Lights from './Environment/Lights/Lights';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture } from '@utils/loaders/loadAssets';
import { Matrix4 } from 'three';

export default class IntroScene extends BaseScene {
	constructor() {
		super({ label: 'Intro', playerPosition: [0, 3, 30] });
	}

	async init() {
		super.init();

		this.lights = new Lights(this);

		this.ground = new Ground(this);
		await this.ground.init();

		this.fog = new BaseFog({
			fogNearColor: '#844bb8',
			fogFarColor: '#3e2e77',
			fogNear: 0,
			fogFar: 140,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await loadCubeTexture('envMap1'),
			/// #if DEBUG
			gui: this.gui,
			/// #endif
		});

		this.instance.add(this.ground.base.mesh);
	}

	update(et, dt) {
		super.update(et, dt);
		if (this.ground) this.ground.update(et, dt);
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		this.ground.base.mesh.updateWorldMatrix(true, false);
		const mat4 = new Matrix4();
		mat4.multiplyMatrices(this.ground.base.mesh.matrixWorld, this.ground.base.mesh.matrix);
		this.ground.base.geometry.matrixWorld = this.ground.base.mesh.matrixWorld;

		this.player.setCollider(this.ground.base.geometry);

		this.fog.set();
	}
}

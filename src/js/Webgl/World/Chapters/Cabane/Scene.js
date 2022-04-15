import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Lights from './Environment/Lights/Lights';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { BoxGeometry, Color, Matrix4, Mesh, PlaneGeometry, SphereGeometry, Vector3 } from 'three';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture } from '@utils/loaders/loadAssets';

export default class CabaneScene extends BaseScene {
	constructor() {
		super({ label: 'Cabane', checkpoints: [[0, 10, 0]] });

		this.ground = new Ground(this);
	}

	preload() {
		super.preload();
		this.preloadPromise = Promise.all([this.ground.preload(), loadCubeTexture('envMap2')]);
	}

	async init() {
		super.init();
		const promiseResults = await this.preloadPromise;

		this.fog = new BaseFog({
			fogNearColor: '#ff0000',
			fogFarColor: '#ffff00',
			fogNear: 0,
			fogFar: 140,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: promiseResults[1],
			/// #if DEBUG
			gui: this.gui,
			/// #endif
		});

		this.lights = new Lights(this);

		await this.ground.init();

		this.instance.add(
			this.ground.base.mesh,
			...this.colliders.map((collider) => collider.base.mesh),
		);
	}

	update(et, dt) {
		super.update(et, dt);
		if (this.ground) this.ground.update(et, dt);
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		this.player.broadphase.setMainCollider(this.ground);
		this.player.broadphase.setPropsColliders(this.colliders);

		this.fog.set();
	}
}

import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { BoxGeometry, Color, Matrix4, Mesh, PlaneGeometry, SphereGeometry, Vector3 } from 'three';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture } from '@utils/loaders/loadAssets';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Lights from '@webgl/World/Bases/Lights/Lights';

export default class CabaneScene extends BaseScene {
	constructor() {
		super({ label: 'Cabane' });

		this.ground = new Ground(this);
	}

	preload() {
		super.preload();
		this.ground.preload();
		this.preloadPromise = loadCubeTexture('envMap2');
	}

	async init() {
		super.init();

		this.fog = new BaseFog({
			fogNearColor: '#ff0000',
			fogFarColor: '#ffff00',
			fogNear: 0,
			fogFar: 140,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await this.preloadPromise,
		});

		const ambient = new BaseAmbient({ color: '#fff', intensity: 1, label: 'Ambient' });
		const directional = new BaseDirectionnal({
			color: '#fff',
			intensity: 5,
			label: 'Directionnal',
			position: new Vector3(-10, 0, 10),
		});
		this.lights = new Lights(this, [ambient, directional]);

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

		this.player.broadphase.setGroundCollider(this.ground);
		this.player.broadphase.setPropsColliders(this.colliders);

		this.fog.set();
	}
}

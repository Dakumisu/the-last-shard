import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Grass from './Props/Grass/Grass';
import Lights from './Environment/Lights/Lights';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture } from '@utils/loaders/loadAssets';
import {
	BoxGeometry,
	Color,
	Matrix4,
	Mesh,
	MeshNormalMaterial,
	SphereGeometry,
	Vector3,
} from 'three';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import BaseCollider from '@webgl/World/Bases/BaseCollider';

export default class IntroScene extends BaseScene {
	constructor() {
		super({
			label: 'Intro',
			checkpoints: [
				[0, 3, 30],
				[-6.5303, 11, -27.421],
				[15, 2, -60],
				[104.32, 14, -65.342],
			],
		});
	}

	async init() {
		super.init();

		this.lights = new Lights(this);

		this.ground = new Ground(this);
		await this.ground.init();

		this.grass = new Grass(this);
		this.grass.init();

		this.fog = new BaseFog({
			fogNearColor: '#844bb8',
			fogFarColor: '#3e2e77',
			fogNear: 0,
			// fogFar: 140,
			fogFar: 30,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await loadCubeTexture('envMap1'),
			/// #if DEBUG
			gui: this.gui,
			/// #endif
		});

		/// #if DEBUG
		const testCube = new BaseCollider({
			mesh: new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial()),
			name: 'cube1',
			type: 'nonWalkable',
		});
		testCube.initPhysics();
		testCube.base.mesh.position.set(2, 1, 12);

		const testCube2 = new BaseCollider({
			mesh: new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial()),
			name: 'cube2',
			type: 'nonWalkable',
		});
		testCube2.initPhysics();
		testCube2.base.mesh.position.set(-6, 1, 12);

		const testCube3 = new BaseCollider({
			mesh: new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial()),
			name: 'cube3',
			type: 'nonWalkable',
		});
		testCube3.initPhysics();
		testCube3.base.mesh.position.set(-3, 1, -20);

		const testCube4 = new BaseCollider({
			mesh: new Mesh(new SphereGeometry(3, 30, 30), new MeshNormalMaterial()),
			name: 'cube4',
			type: 'nonWalkable',
		});
		testCube4.initPhysics();
		testCube4.base.mesh.position.set(-10, 1, 20);

		this.colliders.push(testCube, testCube2, testCube3, testCube4);

		/// #endif

		this.instance.add(
			this.ground.base.mesh,
			...this.colliders.map((collider) => collider.base.mesh),
		);
	}

	update(et, dt) {
		super.update(et, dt);
		if (this.ground) this.ground.update(et, dt);
		if (this.grass) this.grass.update(et, dt);
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		this.player.broadphase.setMainCollider(this.ground);
		this.player.broadphase.setPropsColliders(this.colliders);

		this.fog.set();
	}
}

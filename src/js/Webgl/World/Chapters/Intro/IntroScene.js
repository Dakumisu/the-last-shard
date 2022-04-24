import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Grass from './Props/Grass/Grass';
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
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Lights from '@webgl/World/Bases/Lights/Lights';
import LaserTower from '@webgl/World/Bases/Props/LaserTower';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import LaserGame from '@game/LaserGame';

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

		this.ground = new Ground(this);
	}

	async preload() {
		super.preload();
		await this.ground.preload();
		this.preloadPromise = await loadCubeTexture('envMap1');
	}

	async init() {
		super.init();

		// Lights
		const baseAmbient = new BaseAmbient({ color: '#fff', intensity: 1, label: 'Ambient' });
		const directional = new BaseDirectionnal({
			color: '#45b1e7',
			intensity: 7,
			label: 'Directionnal',
			position: new Vector3(-10, 0, 10),
		});

		this.lights = new Lights(this, [baseAmbient, directional]);

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
			background: await this.preloadPromise,
		});

		const testCube = new BaseCollider({
			mesh: new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial()),
			name: 'cube1',
			type: 'nonWalkable',
			isInteractable: true,
		});
		testCube.initPhysics();
		testCube.base.mesh.position.set(2, 1, 12);

		const testCube2 = new BaseCollider({
			mesh: new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial()),
			name: 'cube2',
			type: 'nonWalkable',
			isInteractable: true,
		});
		testCube2.initPhysics();
		testCube2.base.mesh.position.set(-3, 1, 12);

		const testCube3 = new BaseCollider({
			mesh: new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial()),
			name: 'cube3',
			type: 'nonWalkable',
			isInteractable: true,
		});
		testCube3.initPhysics();
		testCube3.base.mesh.position.set(-3, 1, -20);

		const testCube4 = new BaseCollider({
			mesh: new Mesh(new SphereGeometry(3, 30, 30), new MeshNormalMaterial()),
			name: 'sphere',
			type: 'nonWalkable',
			isInteractable: true,
		});
		testCube4.initPhysics();
		testCube4.base.mesh.position.set(-10, 1, 20);

		this.colliders.push(testCube, testCube2, testCube3, testCube4);

		// LaserTowers

		const laserGame = new LaserGame({ scene: this });

		const laserTower1 = new LaserTower({
			name: 'laserTower1',
			direction: [0, 0, 1],
			towerType: 'first',
			maxDistance: 10,
			game: laserGame,
		});
		await laserTower1.init();
		laserTower1.base.mesh.position.set(2, 0, 20);
		laserTower1.base.mesh.rotation.y = Math.PI / 3;
		laserTower1.initPhysics();

		const laserTower2 = new LaserTower({
			name: 'laserTower2',
			direction: [1, 0, 0],
			towerType: 'between',
			maxDistance: 10,
			game: laserGame,
		});
		await laserTower2.init();
		laserTower2.base.mesh.position.set(-2, 0, 22);
		laserTower2.initPhysics();

		const laserTower3 = new LaserTower({
			name: 'laserTower3',
			direction: [0, 0, 1],
			towerType: 'between',
			maxDistance: 10,
			game: laserGame,
		});
		await laserTower3.init();
		laserTower3.base.mesh.position.set(2, 0, 23);
		laserTower3.initPhysics();

		const laserTower4 = new LaserTower({
			name: 'laserTower4',
			direction: [0, 0, 1],
			towerType: 'between',
			maxDistance: 10,
			game: laserGame,
		});
		await laserTower4.init();
		laserTower4.base.mesh.position.set(-2, 0, 26);
		laserTower4.initPhysics();

		const laserTower5 = new LaserTower({
			name: 'laserTower5',
			direction: [0, 0, 1],
			towerType: 'between',
			maxDistance: 10,
			game: laserGame,
		});
		await laserTower5.init();
		laserTower5.base.mesh.position.set(-4, 0, 30);
		laserTower5.initPhysics();

		const laserTower6 = new LaserTower({
			name: 'laserTower6',
			towerType: 'end',
			maxDistance: 10,
			game: laserGame,
		});
		await laserTower6.init();
		laserTower6.base.mesh.position.set(2, 0, 35);
		laserTower6.initPhysics();

		this.colliders.push(...laserGame.laserTowers);

		this.interactablesBroadphase = new InteractablesBroadphase({
			radius: 1,
			objectsToTest: this.colliders,
		});

		this.instance.add(
			this.ground.base.mesh,
			...this.colliders.map((collider) => collider.base.mesh),
		);
	}

	update(et, dt) {
		super.update(et, dt);
		if (this.ground) this.ground.update(et, dt);
		if (this.grass) this.grass.update(et, dt);

		/// #if DEBUG
		if (this.interactablesBroadphase)
			this.interactablesBroadphase.update(this.player.base.mesh.position);
		/// #endif
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		this.player.broadphase.setMainCollider(this.ground);
		this.player.broadphase.setPropsColliders(this.colliders);

		this.fog.set();
	}
}

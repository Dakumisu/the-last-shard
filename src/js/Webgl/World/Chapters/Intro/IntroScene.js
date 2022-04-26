import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Grass from '../../Bases/Grass/Grass';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { BoxGeometry, Mesh, MeshNormalMaterial, SphereGeometry, Vector3 } from 'three';
import BaseCollider from '@webgl/World/Bases/BaseCollider';
import { loadCubeTexture, loadTexture } from '@utils/loaders/loadAssets';
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Lights from '@webgl/World/Bases/Lights/Lights';
import LaserTower from '@webgl/World/Bases/Props/LaserTower';
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

		this.ground.init();

		this.fog = new BaseFog({
			fogNearColor: '#844bb8',
			fogFarColor: '#3e2e77',
			fogNear: 0,
			fogFar: 30,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await this.preloadPromise,
		});

		// Init grass after fog
		this.grass = new Grass({
			scene: this,
			params: {
				color: '#de47ff',
				count: 300000,
				verticeScale: 0.42,
				halfBoxSize: 28,
				maskRange: 0.04,
				elevationIntensity: 0.25,
				noiseElevationIntensity: 0.75,
				noiseMouvementIntensity: 0.2,
				windColorIntensity: 0.2,
				displacement: 0.2,
				speed: 0.15,
				positionsTexture: await loadTexture('grassTexture'),
			},
		});
		await this.grass.init();

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

		if (this.interactablesBroadphase)
			this.interactablesBroadphase.update(this.player.base.mesh.position);
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		this.player.broadphase.setMainCollider(this.ground);
		this.player.broadphase.setPropsColliders(this.colliders);

		this.fog.set();
	}
}

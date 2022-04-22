import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Grass from '../../Bases/Grass/Grass';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture, loadTexture } from '@utils/loaders/loadAssets';
import { BoxGeometry, Mesh, MeshNormalMaterial, SphereGeometry, Vector3 } from 'three';
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Lights from '@webgl/World/Bases/Lights/Lights';
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

		/// #if DEBUG
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

		this.interactablesBroadphase = new InteractablesBroadphase({
			radius: 0.7,
			objectsToTest: this.colliders,
		});

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

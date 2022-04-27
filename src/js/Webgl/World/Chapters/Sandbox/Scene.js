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

export default class SandboxScene extends BaseScene {
	constructor(manifest) {
		super({
			label: 'Sandbox',
			manifest: manifest,
		});

		this.manifest = manifest;
	}

	async preload() {
		super.preload();
		this.envMapTexture = await loadCubeTexture('envMap1');

		this.isPreloaded.resolve();
	}

	async init() {
		super.init();

		await this.isPreloaded;

		// Lights
		const baseAmbient = new BaseAmbient({ color: '#fff', intensity: 1, label: 'Ambient' });
		const directional = new BaseDirectionnal({
			color: '#45b1e7',
			intensity: 7,
			label: 'Directionnal',
			position: new Vector3(-10, 0, 10),
		});

		this.lights = new Lights(this, [baseAmbient, directional]);

		// this.ground = new Ground(this);
		// await this.ground.init();

		// this.grass = new Grass(this);
		// this.grass.init();

		this.fog = new BaseFog({
			fogNearColor: '#844bb8',
			fogFarColor: '#3e2e77',
			fogNear: 0,
			// fogFar: 140,
			fogFar: 30,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await this.envMapTexture,
		});

		console.log(this.fog);

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
		testCube4.base.mesh.position.set(-20, 1, 20);

		this.colliders.push(testCube, testCube2, testCube3, testCube4);

		this.interactablesBroadphase = new InteractablesBroadphase({
			radius: 2,
			objectsToTest: this.colliders,
		});
		/// #endif

		this.instance.add(...this.colliders.map((collider) => collider.base.mesh));
	}

	update(et, dt) {
		super.update(et, dt);
		if (this.ground) this.ground.update(et, dt);
		if (this.grass) this.grass.update(et, dt);

		// /// #if DEBUG
		// if (this.interactablesBroadphase)
		// 	this.interactablesBroadphase.update(this.player.base.mesh.position);
		// /// #endif
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		this.fog.set();
	}
}

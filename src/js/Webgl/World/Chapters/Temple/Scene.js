import BaseScene from '@webgl/Scene/BaseScene';
import Grass from '@webgl/World/Bases/Grass/Grass';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { Vector3 } from 'three';
import { loadCubeTexture, loadTexture } from '@utils/loaders/loadAssets';
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Lights from '@webgl/World/Bases/Lights/Lights';

export default class TempleScene extends BaseScene {
	constructor(manifest) {
		super({
			label: 'Temple',
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

		await this.manifestLoaded;

		// Lights
		const baseAmbient = new BaseAmbient({ color: '#fff', intensity: 1, label: 'Ambient' });
		const directional = new BaseDirectionnal({
			color: '#45b1e7',
			intensity: 7,
			label: 'Directionnal',
			position: new Vector3(-10, 0, 10),
		});

		this.lights = new Lights(this, [baseAmbient, directional]);

		// this.fog = new BaseFog({
		// 	fogNearColor: '#844bb8',
		// 	fogFarColor: '#3e2e77',
		// 	fogNear: 30,
		// 	fogFar: 50,
		// 	fogNoiseSpeed: 0.003,
		// 	fogNoiseFreq: 0.125,
		// 	fogNoiseImpact: 0.1,
		// 	background: await this.envMapTexture,
		// });

		// Init grass after fog
		// this.grass = new Grass({
		// 	scene: this,
		// 	params: {
		// 		color: '#de47ff',
		// 		count: 100000,
		// 		verticeScale: 0.42,
		// 		halfBoxSize: 30,
		// 		maskRange: 0.04,
		// 		noiseElevationIntensity: 0.75,
		// 		noiseMouvementIntensity: 0.2,
		// 		windColorIntensity: 0.2,
		// 		displacement: 0.2,
		// 		positionsTexture: await loadTexture('grassTexture'),
		// 	},
		// });
		// await this.grass.init();

		// this.instance.add(...this.colliders.map((collider) => collider.base.mesh));
		this.initialized.resolve(true);
		this.isInitialized = true;
	}

	update(et, dt) {
		super.update(et, dt);
		// if (this.grass) this.grass.update(et, dt);
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		// this.fog.set();
	}
}

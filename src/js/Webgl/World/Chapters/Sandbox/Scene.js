import BaseScene from '@webgl/Scene/BaseScene';
import Grass from '@webgl/World/Bases/Grass/Grass';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { Vector3 } from 'three';
import { loadCubeTexture, loadTexture } from '@utils/loaders/loadAssets';
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Lights from '@webgl/World/Bases/Lights/Lights';
import Particles from '@webgl/World/Bases/Particles/Particles';

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

		await this.manifestLoaded;

		// Lights
		const baseAmbient = new BaseAmbient({ color: '#fff', intensity: 1, label: 'Ambient' });
		const directional = new BaseDirectionnal({
			color: '#fff',
			intensity: 7,
			label: 'Directionnal',
			position: new Vector3(-10, 0, 10),
		});

		this.lights = new Lights(this, [baseAmbient, directional]);

		this.fog = new BaseFog({
			fogNearColor: '#664CB1',
			fogFarColor: '#3e2e77',
			fogNear: 0,
			fogFar: 45,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await this.envMapTexture,
		});

		this.grass = new Grass(this, {
			color: '#C1C2FF',
			color2: '#664CB1',
			halfBoxSize: 25,
			scale: 1,
			positionsTexture: await loadTexture('grassTexture'),
		});

		this.particles = new Particles({
			scene: this,
			params: {
				color: '#C1C2FF',
				color2: '#664CB1',
				count: 500,
				halfBoxSize: 30,
				positionsTexture: await loadTexture('grassTexture'),
			},
		});

		// this.fogParticles = new FogParticles({
		// 	scene: this,
		// 	params: {
		// 		color: '#C1C2FF',
		// 		color2: '#664CB1',
		// 		count: 10000,
		// 		halfBoxSize: 30,
		// 		positionsTexture: await loadTexture('grassTexture'),
		// 	},
		// });

		this.initialized.resolve(true);
		this.isInitialized = true;
	}

	update(et, dt) {
		super.update(et, dt);
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		this.fog.set();
	}
}

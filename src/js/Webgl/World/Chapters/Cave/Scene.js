import BaseScene from '@webgl/Scene/BaseScene';
import Grass from '@webgl/World/Bases/Grass/Grass';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { loadCubeTexture, loadTexture } from '@utils/loaders/loadAssets';
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Lights from '@webgl/World/Bases/Lights/Lights';
import Particles from '@webgl/World/Bases/Particles/Particles';
import FogParticles from '@webgl/World/Bases/FogParticles/FogParticles';
import Flowers from '@webgl/World/Bases/Flowers/Flowers';

export default class CaveScene extends BaseScene {
	constructor(manifest) {
		super({
			label: 'Cave',
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
		this.fog = new BaseFog({
			fogNearColor: '#664CB1',
			fogFarColor: '#3e2e77',
			fogNear: 0,
			fogFar: 25,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await this.envMapTexture,
		});

		// Init grass after fog
		this.grass = new Grass(this, {
			color: '#66C0ef',
			color2: '#664CB1',
			halfBoxSize: 25,
			scale: 1,
			positionsTexture: this.terrainSplatting,
		});

		this.particles = new Particles({
			scene: this,
			params: {
				color: '#C1C2FF',
				color2: '#664CB1',
				count: 250,
				halfBoxSize: 25,
				positionsTexture: this.terrainSplatting,
			},
		});

		this.flowers = new Flowers(this, {
			color: '#66C0ef',
			// color: '#9799f7',
			// color: '#66C0ef',
			color2: '#664CB1',
			verticeScale: 0.2,
			halfBoxSize: 25,
			noiseElevationIntensity: 0.75,
			noiseMouvementIntensity: 0.15,
			windColorIntensity: 0.11,
			displacement: 0.08,
			scale: 1,
			positionsTexture: this.terrainSplatting,
		});

		this.fogParticles = new FogParticles({
			scene: this,
			params: {
				color: '#664CB1',
				count: 3000,
				halfBoxSize: 25,
				positionsTexture: this.terrainSplatting,
				fogTexture: await loadTexture('fogTexture'),
			},
		});


		// this.instance.add(...this.colliders.map((collider) => collider.base.mesh));
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
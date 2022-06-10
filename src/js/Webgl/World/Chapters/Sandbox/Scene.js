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
import Flowers from '@webgl/World/Bases/Flowers/Flowers';
import FogParticles from '@webgl/World/Bases/FogParticles/FogParticles';
import Flowers2 from '@webgl/World/Bases/Flowers2/Flowers';

// import signal from 'philbin-packages/signal';
import { wait } from 'philbin-packages/async';

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
		await this.getCinematrix();
		super.init();

		await this.manifestLoaded;

		// Lights
		const baseAmbient = new BaseAmbient({ color: '#fff', intensity: 1, label: 'Ambient' });
		const directional = new BaseDirectionnal({
			color: '#fff',
			intensity: 2,
			label: 'Directionnal',
			position: new Vector3(-10, 0, 10),
		});

		this.lights = new Lights(this, [baseAmbient, directional]);

		this.fog = new BaseFog({
			fogNearColor: '#664CB1',
			fogFarColor: '#3e2e77',
			fogNear: 0,
			fogFar: 60,
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
			grass: await loadTexture('grassPattern'),
			positionsTexture: this.terrainSplatting,
		});

		this.flowers = new Flowers(this, {
			color: '#66C0ef',
			color2: '#664CB1',
			verticeScale: 0.2,
			halfBoxSize: 15,
			noiseElevationIntensity: 0.75,
			noiseMouvementIntensity: 0.15,
			windColorIntensity: 0.11,
			displacement: 0.08,
			scale: 1,
			positionsTexture: this.terrainSplatting,
		});

		this.flowers2 = new Flowers2(this, {
			color: '#66C0ef',
			color2: '#664CB1',
			verticeScale: 0.2,
			// halfBoxSize: 15,
			noiseElevationIntensity: 0.75,
			noiseMouvementIntensity: 0.15,
			windColorIntensity: 0.11,
			displacement: 0.08,
			halfBoxSize: 25,
			scale: 1,
			positionsTexture: this.terrainSplatting,
		});

		this.particles = new Particles({
			scene: this,
			params: {
				color: '#C1C2FF',
				color2: '#664CB1',
				count: 1000,
				halfBoxSize: 25,
				positionsTexture: this.terrainSplatting,
			},
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

		this.initialized.resolve(true);
		this.isInitialized = true;
	}

	async getCinematrix() {
		const cinematrixClasses = import.meta.globEager('./Cinematrix/*.js');

		for (const path in cinematrixClasses) {
			// Get the class
			const _c = await cinematrixClasses[path];
			// Get the name of the folder where the cinematrix is
			const _n = path.split('/')[2].split('.')[0];
			// Assign the class to the cinematrix
			this.cinematrixClasses[_n.toLowerCase()] = _c[_n];
		}
	}

	update(et, dt) {
		if (!this.isInitialized) return;

		super.update(et, dt);
	}

	addTo(mainScene) {
		super.addTo(mainScene);

		this.fog.set();
	}
}

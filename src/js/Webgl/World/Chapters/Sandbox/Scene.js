import BaseScene from '@webgl/Scene/BaseScene';
import Grass from '@webgl/World/Bases/Grass/Grass';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { Vector3 } from 'three';
import { loadCubeTexture, loadModel, loadTexture } from '@utils/loaders/loadAssets';
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Lights from '@webgl/World/Bases/Lights/Lights';
import Particles from '@webgl/World/Bases/Particles/Particles';
import Flowers from '@webgl/World/Bases/Flowers/Flowers';
import FogParticles from '@webgl/World/Bases/FogParticles/FogParticles';
import Flowers2 from '@webgl/World/Bases/Flowers2/Flowers';
import Flowers3 from '@webgl/World/Bases/Flowers3/Flowers';

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
		const baseAmbient = new BaseAmbient({ color: '#fff', intensity: 0, label: 'Ambient' });
		const directional = new BaseDirectionnal({
			color: '#fff',
			intensity: 5,
			label: 'Directionnal',
			position: new Vector3(-10, 0, 10),
		});

		this.lights = new Lights(this, [baseAmbient, directional]);

		this.fog = new BaseFog({
			// fogNearColor: '#d4d4d4',
			// fogFarColor: '#f5f5f5',
			fogNearColor: '#cf80f1',
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
			// color: '#c1f376',
			// color2: '#55C233',
			color: '#cfa1f1',
			color2: '#8277ff',
			halfBoxSize: 10,
			scale: 0.15,
			grass: await loadTexture('grassPattern'),
			diffuse: await loadTexture('grassDiffuse'),
			alpha: await loadTexture('grassAlpha'),
			positionsTexture: this.terrainSplatting,
		});

		for (let index = 1; index < 5; index++) {
			this.flowers = new Flowers(this, {
				color: '#cfa1f1',
				color2: '#8277ff',
				// color: '#c1f376',
				// color2: '#55C233',
				halfBoxSize: 10,
				scale: 0.9,
				positionsTexture: this.terrainSplatting,
				model: await loadModel('flower' + index),
			});
		}

		this.particles = new Particles({
			scene: this,
			params: {
				// color: '#82ad46',
				color: '#cfa1f1',
				count: 250,
				halfBoxSize: 15,
				positionsTexture: this.terrainSplatting,
			},
		});

		this.fogParticles = new FogParticles({
			scene: this,
			params: {
				// color: '#f0f0f0',
				color: '#cfa1f1',
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

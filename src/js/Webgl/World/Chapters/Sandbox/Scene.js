import BaseScene from '@webgl/Scene/BaseScene';
import Grass from '@webgl/World/Bases/Grass/Grass';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture, loadModel, loadTexture } from '@utils/loaders/loadAssets';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionalLight from '@webgl/World/Bases/Lights/BaseDirectionalLight';
import Particles from '@webgl/World/Bases/Particles/Particles';
import Flowers from '@webgl/World/Bases/Flowers/Flowers';
import FogParticles from '@webgl/World/Bases/FogParticles/FogParticles';

import GrassParticles from '@webgl/World/Bases/GrassParticles/GrassParticles';

export default class SandboxScene extends BaseScene {
	constructor(manifest) {
		super({
			label: 'Sandbox',
			manifest: manifest,
		});

		this.manifest = manifest;
	}

	async preload() {
		await super.preload();
		this.envMapTexture = await loadCubeTexture('envMap1');

		this.isPreloaded.resolve();
	}

	async init() {
		await this.getCinematrix();
		await super.init();

		await this.manifestLoaded;

		// Lights
		this.baseAmbient = new BaseAmbient({ color: '#fff', label: 'Ambient' });
		this.directionalLight = new BaseDirectionalLight({
			color: '#fff',
			label: 'DirectionalLight',
			minBox: this.minBox,
			maxBox: this.maxBox,
			boxCenter: this.boxCenter,
		});

		this.lights.add(this.baseAmbient.light, this.directionalLight.light);

		/// #if DEBUG
		const lightsFolder = this.gui.addFolder({
			title: 'Lights',
		});
		this.baseAmbient.addTodebug(lightsFolder);
		this.directionalLight.addTodebug(lightsFolder);
		this.lights.add(this.directionalLight.helper, this.directionalLight.camHelper);
		/// #endif

		this.fog = new BaseFog({
			// fogNearColor: '#d4d4d4',
			// fogFarColor: '#f5f5f5',
			fogNearColor: '#6050cf',
			fogFarColor: '#3e2e77',
			fogNear: 30,
			fogFar: 50,
			fogNoiseSpeed: 0.00225,
			fogNoiseFreq: 0.25,
			fogHeightPropagation: 4,
			fogHeightDensity: 0.5,
			background: await this.envMapTexture,
		});

		this.grass = new Grass(this, {
			// color: '#c1f376',
			// color2: '#55C233',
			color: '#31d7ff',
			color2: '#000832',
			// color: '#664cb1',
			// color2: '#9b92ff',
			// color: '#cfa1f1',
			// color: '#6997a7',
			// color2: '#8277ff',
			halfBoxSize: 20,
			scale: 1,
			grass: await loadTexture('grassPattern'),
			diffuse: await loadTexture('grassDiffuse'),
			alpha: await loadTexture('grassAlpha'),
			positionsTexture: this.terrainSplatting,
		});

		for (let index = 1; index < 5; index++) {
			this.flowers = new Flowers(this, {
				color: '#31d7ff',
				color2: '#000832',
				// color: '#c1f376',
				// color2: '#55C233',
				halfBoxSize: 20,
				scale: 1.2,
				positionsTexture: this.terrainSplatting,
				model: await loadModel('flower' + index),
			});
		}

		this.particles = new Particles({
			scene: this,
			params: {
				// color: '#82ad46',
				color: '#9b92ff',
				color2: '#31d7ff',
				count: 500,
				halfBoxSize: 20,
				positionsTexture: this.terrainSplatting,
			},
		});

		this.grassParticles = new GrassParticles({
			scene: this,
			params: {
				// color: '#82ad46',
				color: '#31d7ff',
				color2: '#8277ff',
				count: 2000,
				halfBoxSize: 20,
				positionsTexture: this.terrainSplatting,
			},
		});

		this.fogParticles = new FogParticles({
			scene: this,
			params: {
				// color: '#f0f0f0',
				color: '#8277ff',
				count: 2500,
				halfBoxSize: 20,
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

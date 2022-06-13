import BaseScene from '@webgl/Scene/BaseScene';
import Grass from '@webgl/World/Bases/Grass/Grass';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { loadCubeTexture, loadModel, loadTexture } from '@utils/loaders/loadAssets';
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import BaseAmbient from '@webgl/World/Bases/Lights/BaseAmbient';
import BaseDirectionnal from '@webgl/World/Bases/Lights/BaseDirectionnal';
import Particles from '@webgl/World/Bases/Particles/Particles';
import FogParticles from '@webgl/World/Bases/FogParticles/FogParticles';
import Flowers from '@webgl/World/Bases/Flowers/Flowers';
import GrassParticles from '@webgl/World/Bases/GrassParticles/GrassParticles';

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
			rtCamera: this.rtCamera,
		});
		this.lights.add(baseAmbient.light, directional.light);

		this.fog = new BaseFog({
			// fogNearColor: '#d4d4d4',
			// fogFarColor: '#f5f5f5',
			fogNearColor: '#9e9fc8',
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
				scale: 1,
				positionsTexture: this.terrainSplatting,
				model: await loadModel('flower' + index),
			});
		}

		this.particles = new Particles({
			scene: this,
			params: {
				// color: '#82ad46',
				color: '#8277ff',
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
				color2: '#c1f376',
				count: 1500,
				halfBoxSize: 20,
				positionsTexture: this.terrainSplatting,
			},
		});

		this.fogParticles = new FogParticles({
			scene: this,
			params: {
				// color: '#f0f0f0',
				color: '#8277ff',
				count: 2000,
				halfBoxSize: 20,
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

import SceneController from '@webgl/Scene/Controller.js';
import Sandbox from './Chapters/Sandbox/Scene.js';
import End from './Chapters/End/Scene.js';
import Cabane from './Chapters/Cabane/Scene.js';
// import Scenes from './Chapters/*/Scene.js';
import { loadJSON } from 'philbin-packages/loader';
import { initPlayer } from './Characters/Player.js';
import BaseScene from '@webgl/Scene/BaseScene.js';
import { deferredPromise, wait } from 'philbin-packages/async';

const manifestPath = 'assets/export/Scenes.json';

export default class World {
	constructor() {
		this.sceneController = new SceneController();

		this.manifest = [];
		this.sceneClasses = {};

		this.init();
	}

	async init() {
		await this.setPlayer();
		await this.getScenes();
		await this.initScenes();
	}

	async getScenes() {
		const sceneClasses = import.meta.glob('./Chapters/*/Scene.js');

		for (const path in sceneClasses) {
			// Get the class
			const _c = await sceneClasses[path]();
			// Get the name of the folder where the scene is
			const _n = path.split('/')[2];
			// Assign the class to the scenes
			this.sceneClasses[_n] = _c.default;
		}
		console.log(this.sceneClasses);
	}

	async initScenes() {
		// TODO: load all scenes from manifest
		this.manifest = await loadJSON(manifestPath);

		await this.manifest.forEach((datas, i) => {
			const newScene = this.sceneClasses[datas.name];
			const _scene = new newScene(datas);
			_scene.preload();

			this.sceneController.add(_scene);
		});

		// TODO: get saved scene from localStorage
		this.sceneController.switch('Sandbox');
	}

	async setPlayer() {
		this.player = initPlayer();
	}

	resize() {
		// if (this.player) this.player.resize();
	}

	update(et, dt) {
		if (this.sceneController) this.sceneController.update(et, dt);
		// if (this.sky) this.sky.update(et, dt);
		if (this.player) this.player.update(et, dt);
	}
}

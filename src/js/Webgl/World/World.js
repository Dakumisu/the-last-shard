/// #if DEBUG
const debug = {
	instance: null,
	label: 'Uniforms',
	tab: 'Env',
};
import { getWebgl } from '@webgl/Webgl.js';
/// #endif

import SceneController from '@webgl/Scene/Controller.js';
import { loadJSON } from 'philbin-packages/loader';
import { initPlayer } from './Characters/Player.js';
import baseUniforms from '@webgl/Materials/baseUniforms.js';

const manifestPath = 'assets/export/Scenes.json';

export default class World {
	constructor() {
		this.sceneController = new SceneController();

		this.manifest = [];
		this.sceneClasses = {};

		this.init();

		/// #if DEBUG
		if (!debug.instance) {
			debug.instance = getWebgl().debug;
			this.setDebug();
		}
		/// #endif
	}

	/// #if DEBUG
	setDebug() {
		debug.instance.setFolder(debug.label, debug.tab, true);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(baseUniforms.uWindSpeed, 'value', { label: 'windSpeed' });

		// add other global uniforms here
	}
	/// #endif

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

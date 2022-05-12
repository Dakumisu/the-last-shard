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
import { store } from '@tools/Store.js';
import assetsMap from '@utils/manifest.js';
import { initPet } from './Characters/Pet.js';

export default class World {
	constructor() {
		this.sceneController = new SceneController();

		this.manifest = store.manifest;

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
		this.setPlayer();
		this.setPet();
		await this.getScenes();
		await this.initScenes();
	}

	async getScenes() {
		const sceneClasses = import.meta.globEager('./Chapters/*/Scene.js');

		for (const path in sceneClasses) {
			// Get the class
			const _c = await sceneClasses[path];
			// Get the name of the folder where the scene is
			const _n = path.split('/')[2];
			// Assign the class to the scenes
			this.sceneClasses[_n] = _c.default;
		}
	}

	async initScenes() {
		await this.manifest.forEach((datas, i) => {
			const newScene = this.sceneClasses[datas.name];
			const _scene = new newScene(datas);
			_scene.preload();

			this.sceneController.add(_scene);
		});

		// TODO: get saved scene from localStorage
		this.sceneController.switch('Temple');
	}

	setPlayer() {
		this.player = initPlayer();
	}

	setPet() {
		this.pet = initPet();
	}

	resize() {
		// if (this.player) this.player.resize();
	}

	update(et, dt) {
		if (this.sceneController) this.sceneController.update(et, dt);
		// if (this.sky) this.sky.update(et, dt);
		if (this.player) this.player.update(et, dt);
		if (this.pet) this.pet.update(et, dt);
	}
}

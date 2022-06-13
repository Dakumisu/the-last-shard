import { getWebgl } from '../Webgl';
import signal from 'philbin-packages/signal';
import { wait } from 'philbin-packages/async';
import { store } from '@tools/Store';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'SceneController',
	scenesList: [],
	guiList: null,
};
/// #endif

export default class SceneController {
	constructor() {
		const webgl = getWebgl();
		this.mainScene = webgl.mainScene;
		this.renderer = webgl.renderer.renderer;
		this.scenes = {};
		this.currentScene = null;

		this.listeners();
		/// #if DEBUG
		debug.instance = webgl.debug;
		this.devtool();
		/// #endif
	}

	listeners() {
		signal.on('scene:switch', this.switch.bind(this));
	}

	/// #if DEBUG
	devtool() {
		debug.instance.setFolder(debug.label);
	}

	addToDebug(label, autoSwitch) {
		let previousValue;

		const gui = debug.instance.getFolder(debug.label);

		debug.scenesList = [...debug.scenesList, { text: label, value: label }];

		if (debug.guiList) {
			previousValue = debug.guiList.value;
			debug.guiList.dispose();
		}
		debug.guiList = gui.addBlade({
			view: 'list',
			label: 'Scenes',
			options: debug.scenesList,
			value: autoSwitch ? label : previousValue ? previousValue : label,
		});

		debug.guiList.on('change', (e) => {
			this.switch(e.value);
		});
		const domEl = debug.guiList.controller_.view.valueElement.firstChild.firstChild;
		domEl.style.backgroundColor = '#005fff66';
		domEl.style.color = '#fff';
		const forceColor = () => {
			domEl.style.setProperty('background-color', '#005fff66', 'important');
			domEl.style.setProperty('color', '#fff', 'important');
		};
		domEl.addEventListener('focus', forceColor);
		domEl.addEventListener('mouseover', forceColor);
	}
	/// #endif

	add(scene, autoSwitch) {
		if (!this.scenes[scene.label]) {
			this.scenes[scene.label] = scene;
			/// #if DEBUG
			this.addToDebug(scene.label, autoSwitch);
			/// #endif
			if (autoSwitch) this.switch(scene.label);
			return;
		}
		console.error('Scene already exists');
	}

	get(label) {
		if (this.scenes[label]) return this.scenes[label];
		console.error(`${label} does not exists`);
		return;
	}

	async switch(label) {
		/// #if DEBUG
		console.log('🌆 Prepare to switch Scene :', label);
		/// #endif

		if (this.get(label)) {
			store.game.player.canMove = store.game.player.canInteract = false;

			signal.emit('postpro:transition-in', 500);
			await wait(500);

			if (this.currentScene) {
				/// #if DEBUG
				this.currentScene.gui.hidden = true;
				/// #endif

				signal.emit('sound:beforeSwitch', this.currentScene.label);
				this.currentScene.removeFrom(this.mainScene.instance);
			}

			this.currentScene = this.get(label);
			localStorage.setItem('game:level', label);
			if (!this.currentScene.isInitialized) this.currentScene.init();
			await this.currentScene.initialized;
			/// #if DEBUG
			console.log('🌆 Switch Scene OK :', label);
			/// #endif
			this.currentScene.addTo(this.mainScene.instance);

			await wait(500);
			signal.emit('postpro:transition-out');
			signal.emit('scene:complete');
			signal.emit('sound:afterSwitch', label);
			store.game.player.canMove = store.game.player.canInteract = true;

			this.renderer.shadowMap.needsUpdate = true;

			this.renderer.shadowMap.needsUpdate = true;

			/// #if DEBUG
			this.currentScene.gui.hidden = false;
			/// #endif
		}
	}

	update(et, dt) {
		if (this.currentScene) this.currentScene.update(et, dt);
	}
}

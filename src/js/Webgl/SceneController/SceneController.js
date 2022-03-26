import { getWebgl } from '../Webgl';
import signal from 'philbin-packages/signal/Signal';

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

		this.scenes = {};
		this.currentScene = null;

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.initDebug();
		/// #endif
	}

	init() {
		signal.on('sceneSwitch', this.switch.bind(this));
	}

	/// #if DEBUG
	initDebug() {
		debug.instance.setFolder(debug.label);
	}

	addToDebug(label) {
		const gui = debug.instance.getFolder(debug.label);
		debug.scenesList = [...debug.scenesList, { text: label, value: label }];
		if (debug.guiList) debug.guiList.dispose();
		debug.guiList = gui.addBlade({
			view: 'list',
			label: 'Scenes',
			options: debug.scenesList,
			value: this.currentScene || label,
		});
		console.log(this.currentScene);
		debug.guiList.on('change', (e) => {
			this.switch(e.value);
		});
		debug.guiList.controller_.view.valueElement.firstChild.firstChild.style.backgroundColor =
			'#f55f0066';
		debug.guiList.controller_.view.valueElement.firstChild.firstChild.style.color = '#fff';
	}
	/// #endif

	add(label, scene, autoSwitch) {
		if (!this.scenes[label]) {
			this.scenes[label] = scene;
			/// #if DEBUG
			this.addToDebug(label);
			/// #endif
			if (autoSwitch) this.switch(label);
			return;
		}
		console.error('Scene already exists');
	}

	get(label) {
		if (this.scenes[label]) return this.scenes[label];
		console.error('Scene does not exists');
		return;
	}

	switch(label) {
		console.log('🌆 Switch Scene :', label);
		if (this.get(label)) {
			/// #if DEBUG
			// if (this.currentScene) this.currentScene.gui.expanded = false;
			/// #endif
			this.currentScene = this.get(label);
			// this.currentScene.resize();
			/// #if DEBUG
			// this.currentScene.gui.expanded = true;
			/// #endif
		}
	}
}

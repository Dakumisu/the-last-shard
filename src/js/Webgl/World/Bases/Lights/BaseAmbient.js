/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
const debug = {
	instance: null,
};
/// #endif

import { AmbientLight } from 'three';

export default class BaseAmbient {
	constructor({ color = '#fff', intensity = 1, label = 'noname' } = {}) {
		this.light = new AmbientLight(color, intensity);
		this.light.name = label;

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		/// #endif
	}

	/// #if DEBUG
	addTodebug(parentFolder) {
		const gui = parentFolder.addFolder({
			title: this.light.name,
		});
		console.log(this.light.color);
		gui.addInput(this.light, 'color', {
			view: 'color-2',
		});
		gui.addInput(this.light, 'intensity', {
			min: 0,
			max: 2,
			step: 0.01,
		});
	}

	helpers() {}
	/// #endif
}

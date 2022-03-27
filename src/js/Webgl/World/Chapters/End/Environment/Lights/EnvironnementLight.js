import { getWebgl } from '@webgl/Webgl';
import { AmbientLight } from 'three';

const params = {
	color: '#ffffff',
	intensity: 1,
};

/// #if DEBUG
const debug = {
	instance: null,
};
/// #endif

export default class Ambient {
	constructor() {
		this.light = new AmbientLight(params.color, params.intensity);

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		/// #endif
	}

	/// #if DEBUG
	addTodebug(parentFolder, label) {
		const g = parentFolder.children[0];
		const gui = g.addFolder({
			title: label,
		});
		gui.addInput(params, 'color').on('change', (color) => {
			this.light.color.set(color.value);
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

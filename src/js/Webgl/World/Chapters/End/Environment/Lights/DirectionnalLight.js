import { DirectionalLight, Vector3 } from 'three';

import { getWebgl } from '@webgl/Webgl';

const params = {
	color: '#ff0000',
	intensity: 2,
};

/// #if DEBUG
const debug = {
	instance: null,
};
/// #endif

export default class Directionnal {
	constructor() {
		this.light = new DirectionalLight(params.color, params.intensity);
		this.light.position.set(-10, 0, 10);

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		/// #endif
	}

	/// #if DEBUG
	addTodebug(parentFolder, label) {
		const g = parentFolder.children[1];
		const gui = g.addFolder({
			title: label,
		});

		gui.addInput(params, 'color').on('change', (color) => {
			this.light.color.set(color.value);
		});
		gui.addInput(this.light, 'intensity', {
			min: 0,
			max: 10,
			step: 0.01,
		});

		gui.addInput(this.light.position, 'x', {
			min: 0,
			max: 10,
			step: 0.01,
		});
		gui.addInput(this.light.position, 'y', {
			min: 0,
			max: 10,
			step: 0.01,
		});
		gui.addInput(this.light.position, 'z', {
			min: 0,
			max: 10,
			step: 0.01,
		});
	}

	helpers() {}
	/// #endif
}

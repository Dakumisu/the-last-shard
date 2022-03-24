import { DirectionalLight, Vector3 } from 'three';

import { getWebgl } from '@webgl/Webgl';

const params = {
	color: '#844bb8',
	intensity: 2,
};

/// #if DEBUG
const debug = {
	instance: null,
	label: '',
	parentLabel: '',
};
/// #endif

export default class Directionnal {
	constructor(label, parentLabel) {
		this.light = new DirectionalLight(params.color, params.intensity);
		this.light.position.set(0, 0, 20);

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		debug.label = label;
		debug.parentLabel = parentLabel;
		this.debug();
		/// #endif
	}

	/// #if DEBUG
	debug() {
		const parentGui = debug.instance.getFolder(debug.parentLabel);
		const g = parentGui.children[1];
		const gui = g.addFolder({
			title: debug.label,
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

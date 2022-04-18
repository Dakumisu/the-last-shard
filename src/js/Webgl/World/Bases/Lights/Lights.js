import { Group } from 'three';

/// #if DEBUG
const debug = {
	parentFolder: null,
	label: 'Lights',
};
/// #endif

export default class Lights {
	constructor(scene, lights = []) {
		this.scene = scene.instance;

		this.lights = lights;

		this.group = new Group();
		this.scene.add(this.group);

		/// #if DEBUG
		debug.parentFolder = scene.gui.addFolder({
			title: debug.label,
			expanded: true,
		});
		/// #endif

		this.setLights();
	}

	setLights() {
		this.lights.forEach((light) => {
			this.group.add(light.light);

			/// #if DEBUG
			light.addTodebug(debug.parentFolder);
			if (light.helper) this.group.add(light.helper);
			/// #endif
		});
	}
}

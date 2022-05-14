/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
import { DirectionalLightHelper } from 'three';

const debug = {
	instance: null,
};
/// #endif

import { DirectionalLight, Vector3 } from 'three';

export default class BaseDirectionnal {
	constructor({
		color = '#fff',
		intensity = 5,
		position = new Vector3(0, 0, 0),
		label = 'noname',
	} = {}) {
		this.light = new DirectionalLight(color, intensity);
		this.light.position.copy(position);
		this.light.name = label;

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		/// #endif
	}

	/// #if DEBUG
	addTodebug(parentFolder) {
		this.helper = new DirectionalLightHelper(this.light, 5);
		this.helper.visible = false;
		// this.light.add(helper);

		const gui = parentFolder.addFolder({
			title: this.light.name,
		});

		gui.addInput(this.light, 'color');
		gui.addInput(this.light, 'intensity', {
			min: 0,
			max: 10,
			step: 0.01,
		});

		gui.addInput(this.light, 'position', {
			min: 0,
			max: 10,
			step: 0.01,
		});

		gui.addInput(this.light, 'quaternion', {
			view: 'rotation',
			picker: 'popup',
			expanded: false,
		});

		gui.addInput(this.helper, 'visible', { label: 'Helper' });
	}

	/// #endif
}

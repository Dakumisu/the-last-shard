import { Group } from 'three';

import { getWebgl } from '@webgl/Webgl';
import Ambient from './EnvironnementLight';
import Directionnal from './DirectionnalLight';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Lights',
	typeLabels: ['Ambient Light', 'Directionnal Light'],
	tab: 'Env',
};
/// #endif

export default class Lights {
	constructor() {
		const webgl = getWebgl();
		this.scene = webgl.scene.instance;

		this.group = new Group();

		/// #if DEBUG
		debug.instance = webgl.debug;
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);

		debug.typeLabels.forEach((label) => {
			gui.addFolder({
				title: label,
			});
		});
		/// #endif

		this.setLights();
	}

	setLights() {
		const ambientLight = new Ambient(
			/// #if DEBUG
			'light one',
			debug.label,
			/// #endif
		);
		const directionnalLight = new Directionnal(
			/// #if DEBUG
			'light one',
			debug.label,
			/// #endif
		);

		this.group.add(directionnalLight.light);
		this.scene.add(this.group);
	}
}

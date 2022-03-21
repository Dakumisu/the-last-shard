import { Group } from 'three';

import { getWebgl } from '@webgl/Webgl';
import Ambient from './EnvironnementLight';
import Directionnal from './DirectionnalLight';

/// #if DEBUG
const debug = {
	instance: null,
	labels: ['Ambient Light', 'Directionnal Light'],
	tab: 'Lights',
};
/// #endif

export default class Lights {
	constructor() {
		const webgl = getWebgl();
		this.scene = webgl.scene.instance;

		this.group = new Group();

		/// #if DEBUG
		debug.instance = webgl.debug;
		debug.labels.forEach((label) => {
			debug.instance.setFolder(label, debug.tab);
		});
		/// #endif

		this.setLights();
	}

	setLights() {
		const ambientLight = new Ambient('light one', debug.labels[0]);
		const directionnalLight = new Directionnal('light one', debug.labels[1]);

		this.group.add(ambientLight.light, directionnalLight.light);
		this.scene.add(this.group);
	}
}

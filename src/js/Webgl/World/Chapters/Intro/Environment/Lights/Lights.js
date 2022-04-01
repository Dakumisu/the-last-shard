import { Group } from 'three';

import Ambient from './EnvironnementLight';
import Directionnal from './DirectionnalLight';

/// #if DEBUG
const debug = {
	parentFolder: null,
	label: 'Lights',
	typeLabels: ['Directionnal Light'],
};
/// #endif

export default class Lights {
	constructor(scene) {
		this.scene = scene.instance;

		this.group = new Group();

		/// #if DEBUG
		debug.parentFolder = scene.gui.addFolder({
			title: debug.label,
			expanded: true,
		});

		debug.typeLabels.forEach((label) => {
			debug.parentFolder.addFolder({
				title: label,
			});
		});
		/// #endif

		this.setLights();
	}

	setLights() {
		const directionnalLight = new Directionnal();

		/// #if DEBUG
		directionnalLight.addTodebug(debug.parentFolder, 'light one');
		/// #endif

		this.group.add(directionnalLight.light);
		this.scene.add(this.group);
	}
}

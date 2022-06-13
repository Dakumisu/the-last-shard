/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
import { CameraHelper, DirectionalLightHelper } from 'three';

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
		rtCamera = null,
	} = {}) {
		this.light = new DirectionalLight(color, intensity);
		this.light.castShadow = true;
		// this.light.shadow.camera = rtCamera;
		this.light.shadow.mapSize.width = 512; // default
		this.light.shadow.mapSize.height = 512; // default
		// this.light.shadow.camera.near = 0.5; // default
		// this.light.shadow.camera.far = 1000; // default
		this.light.shadow.radius = 1; // default

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

		this.camHelper = new CameraHelper(this.light.shadow.camera);

		const gui = parentFolder.addFolder({
			title: this.light.name,
		});

		gui.addInput(this.light, 'color', {
			view: 'color-2',
		});
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

		const shadowsFolder = parentFolder.addFolder({
			title: 'Shadows',
		});
		shadowsFolder.addInput(this.light.shadow.camera, 'near');
		shadowsFolder.addInput(this.light.shadow.camera, 'far');
		shadowsFolder.addInput(this.light.shadow, 'radius');
		shadowsFolder.addInput(this.light.shadow, 'bias', {
			min: -0.00001,
			max: 0.00001,
			step: 0.0000001,
		});
	}

	/// #endif
}

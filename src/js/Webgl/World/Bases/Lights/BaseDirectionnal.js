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
		minBox = null,
		maxBox = null,
		boxCenter = null,
	} = {}) {
		const _maxBox = maxBox.clone();
		const _minBox = minBox.clone();
		_minBox.z -= 10;
		_maxBox.z += 10;
		_minBox.x -= 10;
		_maxBox.x += 10;
		_maxBox.y += 10;
		const camNear = 1;
		const camWidth = _maxBox.x + Math.abs(_minBox.x);
		const camHeight = _maxBox.z + Math.abs(_minBox.z);

		this.light = new DirectionalLight(color, intensity);
		this.light.castShadow = true;
		this.light.shadow.camera.left = camWidth / -2;
		this.light.shadow.camera.right = camWidth / 2;
		this.light.shadow.camera.top = camHeight / 2;
		this.light.shadow.camera.bottom = camHeight / -2;

		this.light.shadow.mapSize.width = 2048;
		this.light.shadow.mapSize.height = 2048;
		this.light.shadow.camera.near = camNear;
		this.light.shadow.camera.far = _maxBox.y + Math.abs(_minBox.y) + camNear;

		this.light.position.set(boxCenter.x, _maxBox.y + camNear, boxCenter.z);

		this.light.rotation.x = -Math.PI * 0.5;

		// this.light.position.copy(rtCamera.position);

		// this.light.shadow.camera.rotation.x = -Math.PI * 0.5;
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
			min: -0.005,
			max: 0.005,
			step: 0.0000001,
		});
		shadowsFolder.addInput(this.light.shadow, 'normalBias', {
			min: -0.005,
			max: 0.005,
			step: 0.0000001,
		});
	}

	/// #endif
}

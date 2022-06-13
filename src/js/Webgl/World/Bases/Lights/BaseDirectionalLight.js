/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
import { CameraHelper, DirectionalLightHelper, DirectionalLight } from 'three';

const debug = {
	instance: null,
};
/// #endif

export default class BaseDirectionalLight {
	constructor({
		color = '#fff',
		intensity = 1.5,
		label = 'noname',
		minBox = null,
		maxBox = null,
		boxCenter = null,
	} = {}) {
		const _maxBox = maxBox.clone();
		const _minBox = minBox.clone();
		_minBox.z -= 100;
		_maxBox.z += 100;
		_minBox.x -= 100;
		_maxBox.x += 100;
		// _maxBox.y += 50;

		const camNear = 1;
		const camWidth = _maxBox.x + Math.abs(_minBox.x);
		const camHeight = _maxBox.z + Math.abs(_minBox.z);

		this.light = new DirectionalLight(color, intensity);

		this.light.castShadow = true;

		this.light.shadow.autoUpdate = true;

		this.light.shadow.camera.left = camWidth / -2;
		this.light.shadow.camera.right = camWidth / 2;
		this.light.shadow.camera.top = camHeight / 2;
		this.light.shadow.camera.bottom = camHeight / -2;
		this.light.shadow.camera.near = 1;
		// this.light.shadow.camera.far = _maxBox.y + Math.abs(_minBox.y) + camNear;
		this.light.shadow.camera.far = Math.max(camWidth, camHeight) + camNear;

		this.light.shadow.mapSize.width = 2048;
		this.light.shadow.mapSize.height = 2048;

		this.light.shadow.bias = -0.00086957;
		// this.light.shadow.normalBias = 0;

		this.light.shadow.blurSamples = 4;
		this.light.shadow.radius = 1.4;

		this.light.position.set(boxCenter.x + 20, _maxBox.y + 1, boxCenter.z + 20);
		this.light.lookAt(this.light.position);

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
			max: 100,
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
			min: -0.01,
			max: 0.01,
			step: 0.00000001,
		});
		shadowsFolder.addInput(this.light.shadow, 'normalBias', {
			min: -0.01,
			max: 0.01,
			step: 0.00000001,
		});
		shadowsFolder.addInput(this.light.shadow, 'blurSamples', {
			min: 1,
			max: 10,
			step: 1,
		});
	}

	/// #endif
}

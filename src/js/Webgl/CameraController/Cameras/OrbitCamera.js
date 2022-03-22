import { store } from '@tools/Store';
import { orbitController } from '@utils/webgl';
import { getWebgl } from '@webgl/Webgl';

/// #if DEBUG
const debug = {
	instance: null,
};
/// #endif

export default class OrbitCamera {
	constructor(orbitParams = {}, label) {
		const webgl = getWebgl();

		this.orbitParams = orbitParams;
		this.label = label;

		this.instance = webgl.camera.instance.clone();
		this.camObject = {
			camera: this.instance,
			orbit: orbitController(this.instance, {
				minDistance: orbitParams.minDistance,
				maxDistance: orbitParams.maxDistance,
				useOrbitKeyboard: false,
			}),
		};

		this.camObject.camera.rotation.reorder('YXZ');

		this.camObject.orbit.sphericalTarget.set(
			orbitParams.spherical.radius,
			orbitParams.spherical.phi,
			orbitParams.spherical.theta,
		);

		this.camObject.camera.aspect = store.aspect.ratio;
		this.camObject.camera.updateProjectionMatrix();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.initDebug();
		/// #endif
	}

	/// #if DEBUG
	initDebug() {
		this.gui = debug.instance
			.getFolder('CameraController')
			.addFolder({ title: this.label ? this.label : 'noname', expanded: false });
		if (this.orbitParams.fps !== undefined)
			this.gui
				.addInput(this.orbitParams, 'fps', {
					label: 'mode',
					options: { Default: false, FPS: true },
				})
				.on('change', (e) => {
					this.camObject.orbit.setFPSMode(e.value);
				});
		this.gui
			.addButton({
				title: 'Toggle auto rotate',
			})
			.on('click', () => {
				this.camObject.orbit.autoRotate = !this.camObject.orbit.autoRotate;
			});
		this.gui
			.addButton({
				title: 'Reset',
			})
			.on('click', () => {
				this.camObject.orbit.sphericalTarget.set(
					this.orbitParams.spherical.radius,
					this.orbitParams.spherical.phi,
					this.orbitParams.spherical.theta,
				);
				// WIP
			});
	}
	/// #endif

	resize() {
		this.camObject.camera.aspect = store.aspect.ratio;
		this.camObject.camera.updateProjectionMatrix();
	}

	update() {
		this.camObject.orbit.update();
	}

	destroy() {
		this.camObject.orbit.destroy();
	}
}

import { Color, Group, Mesh, SphereGeometry, Vector3 } from 'three';

/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
import { getPlayer } from '@webgl/World/Characters/Player';
import Checkpoints from './Checkpoints';
const debug = {
	instance: null,
	debugCam: null,
};
/// #endif

export default class BaseScene {
	constructor({ label, checkpoints = [] }) {
		this.label = label;

		this.player = getPlayer();

		this.instance = new Group();

		this.checkpoints = new Checkpoints({ points: checkpoints, scene: this });

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		debug.debugCam = webgl.debugOrbitCam;
		this.initDebug();
		/// #endif
	}

	/// #if DEBUG
	initDebug() {
		this.gui = debug.instance.getTab('Scene', this.label).addFolder({
			title: this.label ? this.label : 'noname',
			hidden: true,
		});

		const checkpointsFolder = this.gui.addFolder({ title: 'Checkpoints' });

		const checkpointsOptions = [];
		for (let i = 0; i < this.checkpoints.points.length; i++) {
			checkpointsOptions.push({
				text: i + '',
				value: i,
			});
		}
		checkpointsFolder
			.addBlade({
				view: 'list',
				label: 'Tp debugCam',
				options: checkpointsOptions,
				value: 0,
			})
			.on('change', (e) => {
				debug.debugCam.camObject.orbit.targetOffset.fromArray(
					this.checkpoints.points[e.value],
				);
			});

		checkpointsFolder.addButton({ title: 'Tp debugCam to current' }).on('click', () => {
			console.log('🪄 Tp debugCam to current');
			debug.debugCam.camObject.orbit.targetOffset.copy(this.checkpoints.getCurrent());
		});

		checkpointsFolder.addSeparator();

		checkpointsFolder
			.addBlade({
				view: 'list',
				label: 'Tp player',
				options: checkpointsOptions,
				value: 0,
			})
			.on('change', (e) => {
				this.player.base.mesh.position.fromArray(this.checkpoints.points[e.value]);
			});

		checkpointsFolder.addButton({ title: 'Tp player to current' }).on('click', () => {
			console.log('🪄 Tp player to current');
			this.player.base.mesh.position.copy(this.checkpoints.getCurrent());
		});

		checkpointsFolder.addInput(this.checkpoints.checkpointMesh, 'visible', {
			label: 'Sphere',
		});
	}
	/// #endif

	init() {
		this.initialized = true;
	}

	addTo(mainScene) {
		mainScene.add(this.instance);
		this.player.setStartPosition(this.checkpoints.getCurrent());
	}

	removeFrom(mainScene) {
		mainScene.remove(this.instance);
	}

	update(et, dt) {
		if (this.checkpoints) this.checkpoints.update(et, dt);
	}
}

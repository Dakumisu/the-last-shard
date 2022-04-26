/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
const debug = {
	instance: null,
	debugCam: null,
};
/// #endif

import { Color, Group, Mesh, SphereGeometry, Vector3 } from 'three';
import { getPlayer } from '@webgl/World/Characters/Player';
import Checkpoints from '@webgl/World/Props/Checkpoints';
import { loadJSON } from 'philbin-packages/loader';
import { Quaternion } from 'three';
import { deferredPromise } from 'philbin-packages/async';
import Curves from '@webgl/World/Props/Curves';
import Props from '@webgl/World/Props/Props';
import { loadModels } from '@utils/loaders/loadAssets';
import Interactables from '@webgl/World/Props/Interactables';

export default class BaseScene {
	constructor({ label, manifest }) {
		this.label = label;
		this.player = getPlayer();
		this.colliders = [];

		this.instance = new Group();

		this.manifest = manifest || {};
		this.props = null;
		this.curves = null;
		this.checkpoints = null;

		this.isPreloaded = deferredPromise();
		this.manifestLoaded = deferredPromise();
		this.initialized = false;

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		debug.debugCam = webgl.debugOrbitCam;
		this.devtool();
		/// #endif
	}

	/// #if DEBUG
	async devtool() {
		this.gui = debug.instance.getTab('Scene', this.label).addFolder({
			title: this.label ? this.label : 'noname',
			hidden: true,
		});

		await this.manifestLoaded;

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
				debug.debugCam.camObject.orbit.targetOffset.copy(
					this.checkpoints.points[e.value].pos,
				);
			});

		checkpointsFolder.addButton({ title: 'Tp debugCam to current' }).on('click', () => {
			console.log('🪄 Tp debugCam to current');
			debug.debugCam.camObject.orbit.targetOffset.copy(this.checkpoints.getCurrent().pos);
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
				console.log(this.checkpoints.points[e.value]);
				this.player.base.mesh.position.copy(this.checkpoints.points[e.value].pos);
				this.player.base.mesh.quaternion.copy(this.checkpoints.points[e.value].qt);
			});

		checkpointsFolder.addButton({ title: 'Tp player to current' }).on('click', () => {
			console.log('🪄 Tp player to current');

			const _checkpoint = this.checkpoints.getCurrent();
			this.player.base.mesh.position.copy(_checkpoint.pos);
			this.player.base.mesh.quaternion.copy(_checkpoint.qt);
		});

		checkpointsFolder.addInput(this.checkpoints.checkpointMesh, 'visible', {
			label: 'Sphere',
		});
	}
	/// #endif

	async preload() {
		/// #if DEBUG
		console.log('🔋 Preloading Scene :', this.label);
		console.log(`🔋 Manifest of ${this.label}`);
		console.log(this.manifest);
		/// #endif

		this.isPreloaded.resolve();
	}

	async init() {
		this.loadManifest();
		await this.manifestLoaded;

		console.log('🔋 Scene initialized :', this.label);

		this.initialized = true;
	}

	async loadManifest() {
		if (!this.isPreloaded) await this.preload();

		this._loadBase();
		this._loadProps(this.manifest.props);
		this._loadInteractables(this.manifest.interactables);
		this._loadCurves(this.manifest.curves);
		this._loadPoints(this.manifest.points);

		this.manifestLoaded.resolve(true);
	}

	async _loadBase() {
		const model = await loadModels('Scene_' + this.label);
		console.log('base', model);
		this.instance.add(model.children[1]);
		console.log(model);
	}

	async _loadProps(props) {
		console.log('props');
		console.log(props);

		this.props = new Props({ props, scene: this });
		await this.props.init();
	}

	async _loadInteractables(interactables) {
		console.log(interactables);

		this.interactables = new Interactables({ interactables, scene: this });
		await this.interactables.init();
	}

	async _loadCurves(curves) {
		this.curves = new Curves({ curves, scene: this });
	}

	async _loadPoints(points) {
		const checkpoints = [];

		points.forEach((point) => {
			const _t = point.type.toLowerCase();

			if (_t === 'checkpoint') {
				const pos = new Vector3().fromArray(point.pos);
				const qt = new Quaternion().fromArray(point.qt);
				checkpoints.push({ pos, qt });
			}
			if (_t === 'spawn') {
				const pos = new Vector3().fromArray(point.pos);
				const qt = new Quaternion().fromArray(point.qt);
				checkpoints.unshift({ pos, qt });
			}
		});

		this.checkpoints = new Checkpoints({ points: checkpoints, scene: this });
		console.log('🔋 Checkpoints loaded');
	}

	addTo(mainScene) {
		mainScene.add(this.instance);
		this.player.setStartPosition(this.checkpoints.getCurrent());
	}

	removeFrom(mainScene) {
		mainScene.remove(this.instance);
	}

	update(et, dt) {
		if (!this.initialized) return;

		if (this.checkpoints) this.checkpoints.update(et, dt);
	}
}

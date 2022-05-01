/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
const debug = {
	instance: null,
	debugCam: null,
};
/// #endif

import { Group, Vector3 } from 'three';
import { getPlayer } from '@webgl/World/Characters/Player';
import Checkpoints from '@webgl/World/Bases/Props/Checkpoints';
import { Quaternion } from 'three';
import { deferredPromise, wait } from 'philbin-packages/async';
import Curve from '@webgl/World/Bases/Props/Curve';
import Prop from '@webgl/World/Bases/Props/Prop';
import Ground from '@webgl/World/Bases/Props/Ground';
import BaseObject from '@webgl/World/Bases/BaseObject';
import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import LaserGame from '@game/LaserGame';

import LaserTower from '../World/Bases/Interactables/LaserTower';

export default class BaseScene {
	constructor({ label, manifest }) {
		this.label = label;
		this.player = getPlayer();
		this.colliders = [];

		this.instance = new Group();

		this.manifest = manifest || {};
		this.props = new Group();
		this.interactables = new Group();
		this.curves = new Group();
		this.checkpoints = null;

		this.isPreloaded = deferredPromise();
		this.manifestLoaded = deferredPromise();
		this.initialized = deferredPromise();
		this.isInitialized = false;

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
	}

	async init() {
		this.loadManifest();
		await this.manifestLoaded;

		console.log('🔋 Scene initialized :', this.label);
	}

	async loadManifest() {
		await this.isPreloaded;

		let i = 0;
		await this._loadBase();
		console.log(i++);
		await this._loadProps(this.manifest.props);
		console.log(i++);
		await this._loadInteractables(this.manifest.interactables);
		console.log(i++);
		await this._loadCurves(this.manifest.curves);
		console.log(i++);
		await this._loadPoints(this.manifest.points);
		console.log(i++);

		this.manifestLoaded.resolve(true);
	}

	async _loadBase() {
		console.log(this);
		this.ground = new Ground(this);
		await this.ground.init();
	}

	async _loadProps(props) {
		await Promise.all(
			props.map(async (prop) => {
				const _prop = new BaseObject({
					isInteractable: false,
					asset: prop,
					group: this.props,
				});
				await _prop.init();
			}),
		);

		console.log('🔋 Props loaded');

		this.instance.add(this.props);
	}

	async _loadInteractables(interactables) {
		const t = [];
		const laserGames = [];
		await Promise.all(
			interactables.map(async (interactable) => {
				const { asset, params } = interactable;

				if (asset.includes('LaserTower')) {
					if (!laserGames[params.gameId]) {
						const _laserGame = new LaserGame({ scene: this });
						laserGames.push(_laserGame);
					}

					const _interactable = new LaserTower({
						asset: interactable,
						game: laserGames[params.gameId],
						group: this.interactables,
					});
					await _interactable.init();
					t.push(_interactable);
				}

				if (asset.includes('Coin')) {
					// const _interactable = new Coin({
					// 	asset: interactable,
					// 	group: this.interactables,
					// });
					// await _interactable.init();
					// t.push(_interactable);
				}
			}),
		);

		this.interactablesBroadphase = new InteractablesBroadphase({
			radius: 2,
			objectsToTest: t,
		});

		this.instance.add(this.interactables);
	}

	async _loadCurves(curves) {
		await Promise.all(
			curves.map(async (curve) => {
				const _curve = new Curve({ curve, group: this.curves });
			}),
		);

		this.instance.add(this.curves);
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
			// if (_t === 'spawn') {
			// 	const pos = new Vector3().fromArray(point.pos);
			// 	const qt = new Quaternion().fromArray(point.qt);
			// 	checkpoints.unshift({ pos, qt });
			// }
		});

		this.checkpoints = new Checkpoints({ points: checkpoints, scene: this });
		console.log('🔋 Checkpoints loaded');
	}

	addTo(mainScene) {
		mainScene.add(this.instance);
		this.player.setStartPosition(this.checkpoints.getCurrent());

		this.player.broadphase.setGroundCollider(this.ground);
		// this.player.broadphase.setPropsColliders(this.ground);
	}

	removeFrom(mainScene) {
		mainScene.remove(this.instance);
	}

	update(et, dt) {
		if (!this.initialized) return;

		if (this.checkpoints) this.checkpoints.update(et, dt);
		if (this.interactablesBroadphase)
			this.interactablesBroadphase.update(this.player.base.mesh.position);
	}
}

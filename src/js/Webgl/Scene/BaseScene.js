import { Color, Group, Mesh, SphereGeometry, Vector3 } from 'three';

/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
import { getPlayer } from '@webgl/World/Characters/Player';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import Checkpoints from './Checkpoints';
const debug = {
	instance: null,
};
/// #endif

const _pVec3 = new Vector3();

export default class BaseScene {
	constructor({ label, checkpoints = [] }) {
		this.label = label;

		this.player = getPlayer();

		this.instance = new Group();

		this.checkpoints = new Checkpoints({ points: checkpoints, scene: this });

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		this.initDebug();
		/// #endif
	}

	/// #if DEBUG
	initDebug() {
		this.gui = debug.instance.getTab('Scene', this.label).addFolder({
			title: this.label ? this.label : 'noname',
			hidden: true,
		});

		const checkpoints = this.gui.addFolder({ title: 'Checkpoints' });
		checkpoints.addButton({ title: 'Tp to checkpoint' }).on('click', () => {
			console.log('tp to checkpoint');
			this.player.base.mesh.position.copy(_pVec3.fromArray(this.checkpoints.getCurrent()));
		});
	}
	/// #endif

	init() {
		this.initialized = true;
	}

	addTo(mainScene) {
		mainScene.add(this.instance);
		this.player.setStartPosition(_pVec3.fromArray(this.checkpoints.getCurrent()));
	}

	removeFrom(mainScene) {
		mainScene.remove(this.instance);
	}

	update(et, dt) {
		if (this.checkpoints) this.checkpoints.update(et, dt);
	}
}

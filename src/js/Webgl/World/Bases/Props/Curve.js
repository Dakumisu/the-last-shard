import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import signal from 'philbin-packages/signal';
import { Group } from 'three';
import { beziersPath, catmullPath } from '@utils/webgl/blenderCurves';
import { LineBasicMaterial } from 'three';
import { Line } from 'three';
import { BufferGeometry } from 'three';
import { deferredPromise } from 'philbin-packages/async';

export default class Curve {
	constructor({ curve, group }) {
		this.group = group;

		this.rawcurve = curve;
		this.instance = null;

		this.initialized = deferredPromise();

		this.init();

		/// #if DEBUG
		this.devtools();
		/// #endif
	}

	async devtools() {
		await this.initialized;

		const material = new LineBasicMaterial({
			color: 0xff0000,
			linewidth: 1,
		});

		const _points = this.instance.getPoints(250);
		const _geometry = new BufferGeometry().setFromPoints(_points);
		const _curve = new Line(_geometry, material);

		// this.group.add(_curve);
	}

	async init() {
		this.loadCurve();

		this.initialized.resolve(true);
	}

	loadCurve() {
		const { uid, type, curve, closed, points, params } = this.rawcurve;
		if (!curve) return;

		this.name = uid;
		this.params = params;

		const _t = curve.toLowerCase();

		let _curve = null;

		if (_t === 'nurbs') _curve = catmullPath(points, { closed, uid });
		else if (_t === 'bezier') _curve = beziersPath(points, { closed, uid });
		else return;

		this.instance = _curve;
	}

	getCurve(label) {
		return label;
	}

	update(et, dt) {
		if (!this.initialized) return;
	}
}

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Flowers',
};
/// #endif

import {
	BufferAttribute,
	BufferGeometry,
	Color,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	MathUtils,
	Mesh,
	Texture,
} from 'three';

import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { getWebgl } from '@webgl/Webgl';
import BaseScene from '@webgl/Scene/BaseScene';
import signal from 'philbin-packages/signal';
import { deferredPromise } from 'philbin-packages/async';
import { store } from '@tools/Store';
import { loadModel, loadTexture } from '@utils/loaders/loadAssets';
import FlowerMaterial from '@webgl/Materials/Flowers/FlowerMaterial';

const twigsCountList = [0, 0, 100, 100, 100, 100];

export default class Flowers {
	/**
	 *
	 * @param {{scene: BaseScene, params?:{color?: string, color2?: string, halfBoxSize?: number, positionsTexture: Texture}}}
	 */

	constructor(scene, params = {}) {
		console.log(scene);
		this.scene = scene;
		this.params = params;

		const webgl = getWebgl();
		this.renderer = webgl.renderer.renderer;

		this.base = {
			geometry: null,
			material: null,
		};
		this.attributes = {};

		this.triangle = null;

		this.count = twigsCountList[5];

		signal.on('quality', (quality) => {
			this.count = twigsCountList[quality];
			this.updateCount(this.count);
		});

		this.initialized = deferredPromise();

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.init();
	}

	async init() {
		const geometries = [];
		this.model = this.params.model;
		this.texture = await loadTexture('flowerTexture');
		this.texture.flipY = false;

		this.model.traverse((child) => {
			if (child.geometry) {
				const cloned = child.geometry.clone();
				cloned.applyMatrix4(child.matrixWorld);
				cloned.scale(1.4, 1.4, 1.4);
				geometries.push(cloned);
			}
		});
		this.geom = BufferGeometryUtils.mergeBufferGeometries(geometries);

		// this.setTwigGeometry();
		this.initGeometry(twigsCountList[5]);
		this.setGrass();

		this.count = twigsCountList[store.quality];
		this.updateCount(this.count);

		/// #if DEBUG
		this.devtools();
		/// #endif

		this.initialized.resolve();
	}

	setTwigGeometry() {
		this.geom.setIndex(new BufferAttribute(this.model.children[0].geometry.index.array, 1));
		this.geom.setAttribute(
			'position',
			new BufferAttribute(this.model.children[0].geometry.attributes.position.array, 3),
		);
		// this.geom.setAttribute(
		// 	'normal',
		// 	new BufferAttribute(this.model.children[0].geometry.attributes.normal.array, 3),
		// );
		this.geom.setAttribute(
			'uv',
			new BufferAttribute(this.model.children[0].geometry.attributes.uv.array, 2),
		);
	}

	initGeometry(count) {
		const instancecGeom = new InstancedBufferGeometry();

		instancecGeom.index = this.geom.index;
		instancecGeom.attributes.position = this.geom.attributes.position;
		// instancecGeom.attributes.normal = this.geom.attributes.normal;
		instancecGeom.attributes.uv = this.geom.attributes.uv;
		instancecGeom.scale(this.params.scale, this.params.scale, this.params.scale);

		const array = [];
		let id = 0;
		for (let i = 0; i < count; i++) {
			const x = MathUtils.randFloat(-this.params.halfBoxSize, this.params.halfBoxSize);
			const z = MathUtils.randFloat(-this.params.halfBoxSize, this.params.halfBoxSize);
			const scale = MathUtils.randFloat(0.4, 0.6);

			const rX = 0;
			const rY = Math.PI * Math.random() * 2;
			const rZ = 0;
			const rW = Math.PI * Math.random() * 2;

			id++;

			array.push(x, 0, z, scale, rX, rY, rZ, rW);
		}

		// pos + scale + rotation
		this.stride = 3 + 1 + 4;
		this.buffer = new Float32Array(array.length);
		const ib = new InstancedInterleavedBuffer(this.buffer, this.stride);
		this.interleavedBuffer = ib;

		instancecGeom.setAttribute('aPositions', new InterleavedBufferAttribute(ib, 3, 0, false));
		instancecGeom.setAttribute('aScale', new InterleavedBufferAttribute(ib, 1, 3, false));
		instancecGeom.setAttribute('aRotate', new InterleavedBufferAttribute(ib, 4, 4, false));

		const buf = this.buffer;

		for (let i = 0; i < id; i++) {
			buf[i * this.stride + 0] = array[i * this.stride + 0];
			buf[i * this.stride + 1] = array[i * this.stride + 1];
			buf[i * this.stride + 2] = array[i * this.stride + 2];

			buf[i * this.stride + 3] = array[i * this.stride + 3];

			buf[i * this.stride + 4] = array[i * this.stride + 4];
			buf[i * this.stride + 5] = array[i * this.stride + 5];
			buf[i * this.stride + 6] = array[i * this.stride + 6];
			buf[i * this.stride + 7] = array[i * this.stride + 7];
		}

		this.base.geometry = instancecGeom;
	}

	setGrass() {
		this.base.material = new FlowerMaterial({
			transparent: true,
			uniforms: {
				uDisplacement: { value: 0.015 },
				uWindColorIntensity: { value: 0.22 },
				uMaskRange: { value: 0.04 },
				uNoiseMouvementIntensity: { value: 0.15 },
				uNoiseElevationIntensity: { value: 0.75 },
				uHalfBoxSize: { value: this.params.halfBoxSize },
				uCharaPos: { value: this.scene.player.base.mesh.position },
				uElevationTexture: { value: this.scene.depthTexture },
				uGrassTexture: { value: this.params.positionsTexture },
				uMaxMapBounds: { value: this.scene.maxBox },
				uMinMapBounds: { value: this.scene.minBox },
				uTexture: { value: this.texture },
				uColor: { value: new Color().set(this.params.color) },
				uColor2: { value: new Color().set(this.params.color2) },
			},
		});

		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.base.mesh.frustumCulled = false;
		this.scene.instance.add(this.base.mesh);
	}

	async updateCount(count) {
		await this.initialized;

		this.base.geometry.instanceCount = count;
		this.interleavedBuffer.needsUpdate = true;
	}

	/// #if DEBUG
	devtools() {
		const gui = debug.instance.addFolder({ title: debug.label });

		gui.addInput(this.base.mesh.material.uniforms.uDisplacement, 'value', {
			label: 'displace',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addInput(this.base.mesh.material.uniforms.uWindColorIntensity, 'value', {
			label: 'windColorI',
			min: 0,
			max: 0.5,
			step: 0.01,
		});

		gui.addInput(this.base.mesh.material.uniforms.uNoiseMouvementIntensity, 'value', {
			label: 'nMouvementI',
			min: 0,
			max: 0.5,
			step: 0.01,
		});
		gui.addInput(this.base.mesh.material.uniforms.uNoiseElevationIntensity, 'value', {
			label: 'nElevationI',
			min: 0,
			max: 1,
			step: 0.01,
		});
	}
	/// #endif
}

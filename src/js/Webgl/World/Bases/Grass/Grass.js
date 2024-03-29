/// #if DEBUG
const debug = {
	instance: null,
	label: 'Grass',
};
/// #endif

import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	InstancedBufferGeometry,
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	MathUtils,
	Mesh,
	MirroredRepeatWrapping,
	PlaneBufferGeometry,
	Texture,
} from 'three';
import { getWebgl } from '@webgl/Webgl';
import BaseScene from '@webgl/Scene/BaseScene';
import GrassMaterial from '@webgl/Materials/Grass/GrassMaterial';
import signal from 'philbin-packages/signal';
import { deferredPromise } from 'philbin-packages/async';
import { store } from '@tools/Store';
import { loadTexture } from '@utils/loaders';

const twigsCountList = [0, 0, 100000, 200000, 300000, 400000];

export default class Grass {
	/**
	 *
	 * @param {{scene: BaseScene, params?:{color?: string, color2?: string, halfBoxSize?: number, positionsTexture: Texture}}}
	 */

	constructor(scene, params = {}) {
		this.scene = scene;
		this.params = params;

		const webgl = getWebgl();
		this.renderer = webgl.renderer.renderer;
		this.camera = webgl.camera.instance;

		this.base = {
			geometry: null,
			material: null,
		};
		this.attributes = {};

		this.triangle = null;

		this.count = twigsCountList[5];

		this.previousEt = 0;

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

	init() {
		this.setTwigGeometry();
		this.initGeometry(twigsCountList[5]);
		this.setGrass();

		this.count = twigsCountList[store.webgl.quality];
		this.updateCount(this.count);

		/// #if DEBUG
		this.devtools();
		/// #endif

		this.initialized.resolve();
	}

	setTwigGeometry() {
		this.triangle = new BufferGeometry();
		// this.triangle = new PlaneBufferGeometry();

		const vertices = new Float32Array([
			-0.15 * 0.2,
			-0.15 * 0.2,
			0 * 0.2, // bl
			0.15 * 0.2,
			-0.15 * 0.2,
			0 * 0.2, // br
			0 * 0.2,
			0.75 * 0.2,
			0 * 0.2, // tc
		]);

		const normal = new Float32Array([
			0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		]);
		const uv = new Float32Array([0, 1, 1, 1, 0, 0]);
		const indices = new Uint16Array([0, 1, 2]);

		this.triangle.setIndex(new BufferAttribute(indices, 1));
		this.triangle.setAttribute('position', new BufferAttribute(vertices, 3));
		// this.triangle.setAttribute('normal', new BufferAttribute(normal, 3));
		this.triangle.setAttribute('uv', new BufferAttribute(uv, 2));
	}

	initGeometry(count) {
		const geo = new InstancedBufferGeometry();

		geo.index = this.triangle.index;
		geo.attributes.position = this.triangle.attributes.position;
		// geo.attributes.normal = this.triangle.attributes.normal;
		geo.attributes.uv = this.triangle.attributes.uv;
		geo.scale(this.params.scale * 0.5, this.params.scale * 0.75, this.params.scale);

		const array = [];
		let id = 0;
		for (let i = 0; i < count; i++) {
			const x = MathUtils.randFloat(-this.params.halfBoxSize, this.params.halfBoxSize);
			const z = MathUtils.randFloat(-this.params.halfBoxSize, this.params.halfBoxSize);
			const scale = MathUtils.randFloat(3, 4);

			const rX = 0;
			const rY = Math.PI * Math.random() * 2;
			const rZ = 0;
			const rW = Math.PI * Math.random() * 2;

			id++;

			array.push(x, 0, z, scale, rX, rY, rZ, rW);
		}

		// pos + scale
		this.stride = 3 + 1;
		this.buffer = new Float32Array(array.length);
		const ib = new InstancedInterleavedBuffer(this.buffer, this.stride);
		this.interleavedBuffer = ib;

		geo.setAttribute('aPositions', new InterleavedBufferAttribute(ib, 3, 0, false));
		geo.setAttribute('aScale', new InterleavedBufferAttribute(ib, 1, 3, false));
		geo.setAttribute('aRotate', new InterleavedBufferAttribute(ib, 4, 4, false));

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

		this.base.geometry = geo;
	}

	setGrass() {
		const noiseTexture = store.loadedAssets.textures.get('noiseTexture');
		noiseTexture.wrapS = noiseTexture.wrapT = MirroredRepeatWrapping;

		this.base.material = new GrassMaterial({
			side: DoubleSide,
			uniforms: {
				uDisplacement: { value: 0.15 },
				uWindColorIntensity: { value: 0.11 },
				uMaskRange: { value: 0.04 },
				uNoiseMouvementIntensity: { value: 0.15 },
				uNoiseElevationIntensity: { value: 0.75 },
				uHalfBoxSize: { value: this.params.halfBoxSize },
				uCharaPos: { value: this.scene.player.base.mesh.position },
				uCamPos: { value: this.camera.position },
				uColor: { value: new Color().set(this.params.color) },
				uColor2: { value: new Color().set(this.params.color2) },
				uElevationTexture: { value: this.scene.depthTexture },
				uGrassTexture: { value: this.params.positionsTexture },
				uMaxMapBounds: { value: this.scene.maxBox },
				uMinMapBounds: { value: this.scene.minBox },
				uGrass: { value: store.loadedAssets.textures.get('grassPattern') },
				uDiffuse: { value: store.loadedAssets.textures.get('grassDiffuse') },
				uAlpha: { value: store.loadedAssets.textures.get('grassAlpha') },
				uNoiseTexture: { value: noiseTexture },
			},
		});

		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.base.mesh.receiveShadow = true;
		// this.base.mesh.position.y = -0.2;
		// this.base.mesh.renderOrder = 100;
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
		const gui = debug.instance.addFolder({ title: debug.label, expanded: false });

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

		gui.addInput(this.base.material.uniforms.uColor, 'value', { view: 'color-2' });
		gui.addInput(this.base.material.uniforms.uColor2, 'value', { view: 'color-2' });
	}
	/// #endif
}

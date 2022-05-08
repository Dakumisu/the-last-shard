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
	DepthFormat,
	UnsignedShortType,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	MathUtils,
	Mesh,
	DepthTexture,
	OrthographicCamera,
	WebGLRenderTarget,
	Texture,
	Vector3,
	Box3,
	Points,
	AdditiveBlending,
	BoxBufferGeometry,
	MeshNormalMaterial,
} from 'three';

import { getWebgl } from '@webgl/Webgl';
import BaseScene from '@webgl/Scene/BaseScene';
import BaseObject from '../BaseObject';
import ParticleMaterial from '@webgl/Materials/Particle/ParticleMaterial';
import { store } from '@tools/Store';

export default class Particle extends BaseObject {
	constructor({ scene, params }) {
		super({ name: 'Particle', isInteractable: false });

		this.scene = scene;

		this.params = params;

		const webgl = getWebgl();
		this.renderer = webgl.renderer.renderer;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.initialized = false;
	}

	async init() {
		this.setGeometry();
		await this.setMaterial();
		this.setMesh();

		/// #if DEBUG
		this.debug();
		/// #endif

		this.initialized = true;
	}

	setGeometry() {
		this.base.geometry = new BufferGeometry();
		this.base.positions = new Float32Array(this.params.count * 3);
		const scale = new Float32Array(this.params.count * 1);

		for (let i = 0; i < this.params.count; i++) {
			this.base.positions[i * 3 + 0] = MathUtils.randFloatSpread(this.params.halfBoxSize * 2);
			this.base.positions[i * 3 + 1] = MathUtils.randFloat(0, 20);
			this.base.positions[i * 3 + 2] = MathUtils.randFloatSpread(this.params.halfBoxSize * 2);

			scale[i] = MathUtils.randFloat(0, 2);
		}

		this.base.geometry.setAttribute(
			'position',
			new BufferAttribute(this.base.positions, 3, false),
		);
		this.base.geometry.setAttribute('aScale', new BufferAttribute(scale, 1, false));
	}

	async setMaterial() {
		this.base.material = new ParticleMaterial({
			side: DoubleSide,
			depthWrite: false,
			blending: AdditiveBlending,
			uniforms: {
				uPixelRatio: { value: store.resolution.dpr },
				uSize: { value: this.params.size },
				uCharaPos: { value: this.scene.player.base.mesh.position },
				uHalfBoxSize: { value: this.params.halfBoxSize },
			},
		});
	}

	setMesh() {
		this.base.mesh = new Points(this.base.geometry, this.base.material);
		this.scene.instance.add(this.base.mesh);
		this.base.mesh.frustumCulled = false;
	}

	/// #if DEBUG
	debug() {}
	/// #endif

	update(et, dt) {
		if (!this.initialized) return;
	}
}

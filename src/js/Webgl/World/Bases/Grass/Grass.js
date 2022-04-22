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
	ShaderMaterial,
	WebGLRenderTarget,
	Texture,
} from 'three';
import { loadTexture } from '@utils/loaders/loadAssets';

import fragmentShader from './Shaders/fragment.glsl';
import vertexShader from './Shaders/vertex.glsl';
import { getWebgl } from '@webgl/Webgl';
import BaseScene from '@webgl/Scene/BaseScene';
import BaseObject from '../BaseObject';

export default class Grass extends BaseObject {
	/**
	 *
	 * @param {{scene: BaseScene, params?:{color?: string, count?: number, verticeScale?: number, halfBoxSize?: number, maskRange?: number, elevationIntensity?: number, noiseElevationIntensity?: number, noiseMouvementIntensity?: number, windColorIntensity?: number, displacement?: number, speed?: number, positionsTexture: Texture}}} params0
	 */
	constructor({ scene, params }) {
		super({ name: 'Grass', isInteractable: false });

		this.scene = scene;

		this.params = params;

		const webgl = getWebgl();
		this.renderer = webgl.renderer.renderer;

		this.base.material = null;
		this.base.geometry = null;
		this.base.positions = null;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.initialized = false;
	}

	async init() {
		this.setRenderTarget();
		this.setDefaultGeometry();
		this.setGeometry();
		await this.setMaterial();
		this.setMesh();

		/// #if DEBUG
		this.debug();
		/// #endif

		this.initialized = true;
	}

	setRenderTarget() {
		this.minBox = this.scene.ground.base.mesh.geometry.boundingBox.min;
		this.maxBox = this.scene.ground.base.mesh.geometry.boundingBox.max;

		const rtWidth = 512;
		const rtHeight = 512;

		this.rtCamera = new OrthographicCamera(
			this.minBox.x,
			this.maxBox.x,
			this.maxBox.z,
			this.minBox.z,
			1,
			this.maxBox.y + Math.abs(this.minBox.y),
		);
		this.rtCamera.rotation.x = -Math.PI * 0.5;
		this.rtCamera.position.y = this.maxBox.y;

		this.renderTarget = new WebGLRenderTarget(rtWidth, rtHeight);

		this.depthTexture = new DepthTexture(rtWidth, rtHeight);

		this.renderTarget.depthTexture = this.depthTexture;
		this.renderTarget.depthTexture.format = DepthFormat;
		this.renderTarget.depthTexture.type = UnsignedShortType;
	}

	setDefaultGeometry() {
		this.triangle = new BufferGeometry();

		const vertices = new Float32Array([
			-0.5 * this.params.verticeScale,
			-0.5 * this.params.verticeScale,
			0 * this.params.verticeScale, // bl
			0.5 * this.params.verticeScale,
			-0.5 * this.params.verticeScale,
			0 * this.params.verticeScale, // br
			0 * this.params.verticeScale,
			0.5 * this.params.verticeScale,
			0 * this.params.verticeScale, // tc
		]);

		const normal = new Float32Array([
			0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		]);
		const uv = new Float32Array([0, 1, 1, 1, 0, 0]);
		const indices = new Uint16Array([0, 1, 2]);

		this.triangle.setIndex(new BufferAttribute(indices, 1));
		this.triangle.setAttribute('position', new BufferAttribute(vertices, 3));
		this.triangle.setAttribute('normal', new BufferAttribute(normal, 3));
		this.triangle.setAttribute('uv', new BufferAttribute(uv, 2));
	}

	setGeometry() {
		this.base.positions = new Float32Array(this.params.count * 3);
		const scale = new Float32Array(this.params.count * 1);

		for (let i = 0; i < this.params.count; i++) {
			this.base.positions[i * 3 + 0] = MathUtils.randFloatSpread(this.params.halfBoxSize * 2);
			this.base.positions[i * 3 + 2] = MathUtils.randFloatSpread(this.params.halfBoxSize * 2);

			const random = MathUtils.randFloat(1, 2);
			scale[i * 3 + 0] = random;
			scale[i * 3 + 1] = random;
			scale[i * 3 + 2] = random;
		}

		this.base.geometry = new InstancedBufferGeometry();

		this.base.geometry.index = this.triangle.index;
		this.base.geometry.attributes.position = this.triangle.attributes.position;
		this.base.geometry.attributes.normal = this.triangle.attributes.normal;
		this.base.geometry.attributes.uv = this.triangle.attributes.uv;

		this.base.geometry.setAttribute(
			'aPositions',
			new InstancedBufferAttribute(this.base.positions, 3, false),
		);
		this.base.geometry.setAttribute('aScale', new InstancedBufferAttribute(scale, 3, false));
	}

	async setMaterial() {
		this.base.material = new ShaderMaterial({
			side: DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uSpeed: { value: this.params.speed },
				uDisplacement: { value: this.params.displacement },
				uWindColorIntensity: { value: this.params.windColorIntensity },
				uMaskRange: { value: this.params.maskRange },
				uNoiseMouvementIntensity: { value: this.params.noiseMouvementIntensity },
				uNoiseElevationIntensity: { value: this.params.noiseElevationIntensity },
				uElevationIntensity: { value: this.params.elevationIntensity },
				uHalfBoxSize: { value: this.params.halfBoxSize },
				uCharaPos: { value: this.scene.player.base.mesh.position },
				uColor: { value: new Color().set(this.params.color) },
				uFogColor: { value: new Color().set(this.scene.fog.params.fogFarColor) },
				uElevationTexture: { value: this.depthTexture },
				uGrassTexture: { value: this.params.positionsTexture },
				uMaxMapBounds: { value: this.maxBox },
				uMinMapBounds: { value: this.minBox },
			},
			transparent: true,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.scene.instance.add(this.base.mesh);
		this.base.mesh.frustumCulled = false;
	}

	/// #if DEBUG
	debug() {
		const gui = debug.instance.addFolder({ title: debug.label });

		// const texturePlane = new Mesh(
		// 	new PlaneGeometry(1, 1),
		// 	new MeshBasicMaterial({ map: this.depthTexture, side: DoubleSide }),
		// );

		// texturePlane.scale.set(5, 5, 1);
		// texturePlane.position.copy(this.scene.player.base.mesh.position);
		// this.scene.instance.add(texturePlane);

		gui.addInput(this.base.mesh.material.uniforms.uSpeed, 'value', {
			label: 'speed',
			min: 0,
			max: 1,
			step: 0.01,
		});
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
		gui.addInput(this.base.mesh.material.uniforms.uElevationIntensity, 'value', {
			label: 'elevationI',
			min: 0,
			max: 1,
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
		gui.addInput(this.params, 'halfBoxSize', {
			label: 'boxSize',
			min: 1,
			max: 100,
			step: 0.01,
		}).on('change', (size) => {
			if (!size.last) return;
			for (let i = 0; i < this.params.count; i++) {
				this.base.positions[i * 3 + 0] = MathUtils.randFloatSpread(
					this.params.halfBoxSize * 2,
				);
				this.base.positions[i * 3 + 2] = MathUtils.randFloatSpread(
					this.params.halfBoxSize * 2,
				);
			}
			this.base.material.uniforms.uHalfBoxSize.value = size.value;
			this.base.geometry.setAttribute(
				'aPositions',
				new InstancedBufferAttribute(this.base.positions, 3, false),
			);
		});
		gui.addInput(this.base.material.uniforms.uMaskRange, 'value', {
			label: 'maskRange',
			min: 0,
			max: 0.5,
			step: 0.01,
		});

		gui.addInput(this.params, 'color').on('change', (color) => {
			this.base.material.uniforms.uColor.value.set(color.value);
		});
		gui.addInput(this.scene.fog.params, 'fogFarColor').on('change', (color) => {
			this.base.material.uniforms.uFogColor.value.set(color.value);
		});
	}
	/// #endif

	update(et, dt) {
		if (!this.initialized) return;

		this.renderer.setRenderTarget(this.renderTarget);

		// Edit this to render only the Mesh/Group you want to test depth with
		this.renderer.render(this.scene.ground.base.mesh, this.rtCamera);
		// this.renderer.render(this.scene.instance, this.rtCamera);
		this.renderer.setRenderTarget(null);

		this.base.material.uniforms.uTime.value = et;
	}
}

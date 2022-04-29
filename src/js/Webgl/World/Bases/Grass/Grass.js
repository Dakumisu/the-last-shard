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
} from 'three';

import { getWebgl } from '@webgl/Webgl';
import BaseScene from '@webgl/Scene/BaseScene';
import BaseObject from '../BaseObject';
import GrassMaterial from '@webgl/Materials/Grass/GrassMaterial';

export default class Grass extends BaseObject {
	/**
	 *
	 * @param {{scene: BaseScene, params?:{color?: string, count?: number, verticeScale?: number, halfBoxSize?: number, maskRange?: number, noiseElevationIntensity?: number, noiseMouvementIntensity?: number, windColorIntensity?: number, displacement?: number, positionsTexture: Texture}}} params0
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

		this.triangle = null;

		this.minBox = new Vector3();
		this.maxBox = new Vector3();

		this.rtCamera = null;
		const textureSize = 512;
		this.renderTarget = new WebGLRenderTarget(textureSize, textureSize);
		this.depthTexture = new DepthTexture(textureSize, textureSize);

		this.renderTargetRendered = false;

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
		const boundingBox = new Box3().setFromObject(this.scene.ground.base.mesh);

		this.minBox = boundingBox.min;
		this.maxBox = boundingBox.max;

		const center = new Vector3();
		boundingBox.getCenter(center);

		const camNear = 1;
		const camWidth = this.maxBox.x + Math.abs(this.minBox.x);
		const camHeight = this.maxBox.z + Math.abs(this.minBox.z);

		this.rtCamera = new OrthographicCamera(
			camWidth / -2,
			camWidth / 2,
			camHeight / 2,
			camHeight / -2,
			camNear,
			this.maxBox.y + Math.abs(this.minBox.y) + camNear,
		);

		this.rtCamera.position.set(center.x, this.maxBox.y + camNear, center.z);

		this.rtCamera.rotation.x = -Math.PI * 0.5;

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
		this.base.material = new GrassMaterial({
			side: DoubleSide,
			uniforms: {
				uDisplacement: { value: this.params.displacement },
				uWindColorIntensity: { value: this.params.windColorIntensity },
				uMaskRange: { value: this.params.maskRange },
				uNoiseMouvementIntensity: { value: this.params.noiseMouvementIntensity },
				uNoiseElevationIntensity: { value: this.params.noiseElevationIntensity },
				uHalfBoxSize: { value: this.params.halfBoxSize },
				uCharaPos: { value: this.scene.player.base.mesh.position },
				uColor: { value: new Color().set(this.params.color) },
				uFogColor: { value: new Color().set(this.scene.fog.params.fogFarColor) },
				uElevationTexture: { value: this.depthTexture },
				uGrassTexture: { value: this.params.positionsTexture },
				uMaxMapBounds: { value: this.maxBox },
				uMinMapBounds: { value: this.minBox },
			},
		});
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.scene.instance.add(this.base.mesh);
		this.base.mesh.frustumCulled = false;
	}

	/// #if DEBUG
	debug() {
		const canvas = document.createElement('canvas');
		canvas.width = this.depthTexture.source.data.width;
		canvas.height = this.depthTexture.source.data.height;
		canvas.style.transform = 'scaleY(-1)';
		canvas.style.position = 'absolute';
		canvas.style.bottom = '50px';
		this.canvasContext = canvas.getContext('2d');

		const gui = debug.instance.addFolder({ title: debug.label });

		const canvasParams = {
			visible: false,
		};
		gui.addInput(canvasParams, 'visible', { label: 'Texture' }).on('change', () => {
			canvasParams.visible
				? document.body.prepend(canvas)
				: document.body.removeChild(canvas);
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

		if (!this.renderTargetRendered) {
			this.renderTargetRendered = true;
			this.renderer.setRenderTarget(this.renderTarget);
			// Edit this to render only the Mesh/Group you want to test depth with
			this.renderer.render(this.scene.ground.base.realMesh, this.rtCamera);
			// this.renderer.render(this.scene.instance, this.rtCamera);

			/// #if DEBUG
			const buffer = new Uint8Array(this.renderTarget.width * this.renderTarget.height * 4);
			this.renderer.readRenderTargetPixels(
				this.renderTarget,
				0,
				0,
				this.renderTarget.width,
				this.renderTarget.height,
				buffer,
			);
			const data = new ImageData(this.renderTarget.width, this.renderTarget.height);
			data.data.set(buffer);
			this.canvasContext.putImageData(data, 0, 0);
			/// #endif

			this.renderer.setRenderTarget(null);
		}
	}
}

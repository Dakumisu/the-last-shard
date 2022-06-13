/// #if DEBUG
const debug = {
	instance: null,
	debugCam: null,
};
/// #endif

import {
	Box3,
	DataTexture,
	DepthFormat,
	DepthTexture,
	FloatType,
	Group,
	Mesh,
	MeshBasicMaterial,
	OrthographicCamera,
	PlaneBufferGeometry,
	PlaneGeometry,
	Scene,
	UnsignedShortType,
	Vector3,
	WebGLRenderTarget,
	Quaternion,
} from 'three';
import { deferredPromise } from 'philbin-packages/async';
import { map } from 'philbin-packages/maths';
import signal from 'philbin-packages/signal';

import { getWebgl } from '@webgl/Webgl';
import { getPlayer } from '@webgl/World/Characters/Player';

import BaseObject from '@webgl/World/Bases/BaseObject';

import Ground from '@webgl/World/Bases/Props/Ground';
import Curve from '@webgl/World/Bases/Props/Curve';
import Checkpoints from '@webgl/World/Bases/Props/Checkpoints';
import Areas from '@webgl/World/Bases/Props/Areas';

import InteractablesBroadphase from '@webgl/World/Bases/Broadphase/InteractablesBroadphase';
import CollidersBroadphase from '@webgl/World/Bases/Broadphase/CollidersBroadphase';

import Portal from '@webgl/World/Bases/Props/Portal';
import LevelDoor from '@webgl/World/Bases/Movables/LevelDoor';
import Fragment from '@webgl/World/Bases/Interactables/Fragment';

import LaserGame from '@game/LaserGame';
import LaserTower from '../World/Bases/Interactables/LaserTower';

import { loadAudio, loadTexture } from '@utils/loaders';
import { store } from '@tools/Store';

const textureSize = [0, 0, 128, 256, 512, 1024];
const bakeDuration = 2000;

export default class BaseScene {
	constructor({ label, manifest }) {
		const webgl = getWebgl();

		this.mainScene = webgl.mainScene.instance;
		this.raf = webgl.raf;

		this.label = label;
		this.player = getPlayer();
		this.soundController = webgl.world.soundController;
		this.colliders = [];

		this.instance = new Group();

		this.manifest = manifest || {};
		this.props = new Group();
		this.interactables = new Group();
		this.curves = new Group();
		this.checkpoints = null;
		this.areas = null;
		this.portals = [];
		this.grass = null;
		this.lights = new Group();
		this.baseAmbient = this.directionalLight = null;
		this.shadowsBaked = false;
		this.instance.add(this.lights);

		this.isPreloaded = deferredPromise();
		this.manifestLoaded = deferredPromise();
		this.initialized = deferredPromise();
		this.isInitialized = false;

		this.cinematrixClasses = {};

		// Render target
		this.updateRenderTarget = this.updateRenderTarget.bind(this);
		this.minBox = new Vector3();
		this.maxBox = new Vector3();
		this.renderer = webgl.renderer.renderer;
		this.rtCamera = null;
		this.renderTarget = new WebGLRenderTarget(textureSize[5], textureSize[5]);
		this.depthTexture = new DepthTexture(textureSize[5], textureSize[5]);

		signal.on('quality', async (quality) => {
			await this.initialized;

			this.renderTarget = new WebGLRenderTarget(textureSize[quality], textureSize[quality]);
			this.depthTexture = new DepthTexture(textureSize[quality], textureSize[quality]);
			if (quality > 1) requestAnimationFrame(this.updateRenderTarget);
		});

		/// #if DEBUG
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
		for (let i = 0; i < this.checkpoints.list.length; i++) {
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
					this.checkpoints.list[e.value].pos,
				);
			});

		checkpointsFolder.addButton({ title: 'Tp debugCam to current' }).on('click', () => {
			console.log('🪄 Tp debugCam to current');
			debug.debugCam.camObject.orbit.targetOffset.copy(
				this.checkpoints.currentCheckpoint.pos,
			);
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
				this.player.base.mesh.position.copy(this.checkpoints.list[e.value].pos);
				this.player.base.mesh.quaternion.copy(this.checkpoints.list[e.value].qt);
			});

		checkpointsFolder.addButton({ title: 'Tp player to current' }).on('click', () => {
			console.log('🪄 Tp player to current');

			const _checkpoint = this.checkpoints.currentCheckpoint;
			this.player.base.mesh.position.copy(_checkpoint.pos);
			this.player.base.mesh.quaternion.copy(_checkpoint.qt);
		});

		// checkpointsFolder.addInput(this.checkpoints.checkpointMesh, 'visible', {
		// 	label: 'Sphere',
		// });

		const canvas = document.createElement('canvas');
		canvas.width = this.depthTexture.source.data.width;
		canvas.height = this.depthTexture.source.data.height;
		canvas.style.transform = 'scaleY(-0.5) scaleX(0.5)';
		canvas.style.transformOrigin = '0 50%';
		canvas.style.position = 'absolute';
		canvas.style.bottom = '50px';
		this.canvasContext = canvas.getContext('2d');

		const rtFolder = this.gui.addFolder({ title: 'Render Target' });

		const canvasParams = {
			visible: false,
		};
		rtFolder.addInput(canvasParams, 'visible', { label: 'Texture' }).on('change', () => {
			canvasParams.visible
				? document.body.prepend(canvas)
				: document.body.removeChild(canvas);
		});
	}
	/// #endif

	async preload() {
		/// #if DEBUG
		console.log('🔋 Preloading Scene :', this.label);
		console.log(`🔋 Manifest of ${this.label}`);
		/// #endif
		await this.loadTerrainSplatting();
		await this.loadSounds();
		this.setTerrainSplattingData();
		await loadTexture('asset_gradient');
		await loadTexture('grassPattern');
		await loadTexture('grassDiffuse');
		await loadTexture('grassAlpha');
		await loadTexture('noiseTexture');
	}

	async init() {
		this.loadManifest();
		await this.manifestLoaded;

		this.setRenderTarget();

		this.currentTime = this.raf.elapsed;

		console.log('🔋 Scene initialized :', this.label);
	}

	async loadTerrainSplatting() {
		const path = `Scene_${this.label}_TerrainSplatting`;
		const terrain = await loadTexture(path);

		this.terrainSplatting = terrain;
	}

	async loadSounds() {
		await this.soundController.addAmbient(this.label);
	}

	async loadManifest() {
		await this.isPreloaded;

		await this._loadBase();
		await this._loadProps(this.manifest.props);
		await this._loadInteractables(this.manifest.interactables);
		await this._loadCurves(this.manifest.curves);
		await this._loadPoints(this.manifest.points);
		await this._loadAreas(this.manifest.areas);

		this.manifestLoaded.resolve();
	}

	async _loadBase() {
		this.ground = new Ground(this);
		await this.ground.init();

		/// #if DEBUG
		console.log('🔋 Base loaded');
		/// #endif
	}

	async _loadProps(props) {
		if (!props) return;

		const collidersBp = [];

		props.map(async (prop) => {
			if (prop.asset.includes('Portal')) {
				const portal = new Portal(this, {
					name: this.label,
					asset: prop,
					group: this.props,
				});
				await portal.init();
				this.portals.push(portal);

				return;
			}

			if (prop.movable) {
				// door
				if (prop.asset.includes('Door')) {
					const levelDoor = new LevelDoor(this, {
						asset: prop,
						group: this.props,
					});
					await levelDoor.init();
					collidersBp.push(levelDoor);
				}

				// const _prop = new Movable({
				// 	name: this.label,
				// 	asset: prop,
				// 	group: this.props,
				// });
				// await _prop.init();
				// collidersBp.push(_prop);

				return;
			}

			const _prop = new BaseObject({
				asset: prop,
				group: this.props,
			});
			await _prop.init();
		});

		this.collidersBroadphase = new CollidersBroadphase({
			radius: 2,
			objectsToTest: collidersBp,
		});

		this.instance.add(this.props);

		/// #if DEBUG
		console.log('🔋 Props loaded');
		/// #endif
	}

	async _loadInteractables(interactables) {
		if (!interactables) return;

		const interactablesBp = [];
		this.laserGames = [];

		interactables.map(async (interactable) => {
			const { asset, params } = interactable;

			if (asset.includes('LaserTower')) {
				if (!this.laserGames[params.gameId]) {
					const _laserGame = new LaserGame({ scene: this, id: params.gameId });
					this.laserGames.push(_laserGame);
				}

				const _interactable = new LaserTower({
					asset: interactable,
					game: this.laserGames[params.gameId],
					group: this.interactables,
				});
				await _interactable.init();
				interactablesBp.push(_interactable);
			} else if (asset.includes('Fragment')) {
				const _interactable = new Fragment({
					asset: interactable,
					group: this.interactables,
				});
				await _interactable.init();
				interactablesBp.push(_interactable);
			} else {
				const _interactable = new BaseObject({
					isInteractable: true,
					asset: interactable,
					group: this.interactables,
				});
				await _interactable.init();
				// interactablesBp.push(_interactable);
			}
		});

		this.interactablesBroadphase = new InteractablesBroadphase({
			radius: 2,
			objectsToTest: interactablesBp,
		});

		this.instance.add(this.interactables);

		/// #if DEBUG
		console.log('🔋 Props loaded');
		/// #endif
	}

	async _loadCurves(curves) {
		if (!curves) return;

		await curves.map(async (curve) => {
			const _curve = new Curve({ curve, group: this.curves });

			// create a cinematic camera
			if (curve.type.includes('cam')) {
				const name = curve.name.toLowerCase();

				if (!this.cinematrixClasses[name]) return;

				const Cinematrix = this.cinematrixClasses[name];
				new Cinematrix({ scene: this.label.toLowerCase(), name: name, curve: _curve });
			}
		});

		/// #if DEBUG
		this.instance.add(this.curves);
		console.log('🔋 Curves loaded');
		/// #endif
	}

	async _loadPoints(points) {
		if (!points) return;

		const pointsList = [];

		points.forEach((point) => {
			const _t = point.type.toLowerCase();

			if (_t === 'checkpoint') {
				const pos = new Vector3().fromArray(point.pos);
				const qt = new Quaternion().fromArray(point.qt);
				pointsList.push({ pos, qt });
			}
			if (_t === 'spawn') {
				const pos = new Vector3().fromArray(point.pos);
				const qt = new Quaternion().fromArray(point.qt);
				pointsList.unshift({ pos, qt });
			}
		});

		this.checkpoints = new Checkpoints({ points: pointsList, scene: this });

		/// #if DEBUG
		console.log('🔋 Checkpoints loaded');
		/// #endif
	}

	async _loadAreas(areas) {
		if (!areas) return;

		const areasList = [];

		areas.forEach((area) => {
			const zone = area.zone.toLowerCase();
			const pos = new Vector3().fromArray(area.pos);
			const size = area.size;
			const dialog = area.dialog;

			areasList.push({ pos, zone, size, dialog });
		});

		this.areas = new Areas({ areas: areasList, scene: this });

		/// #if DEBUG
		console.log('🔋 Areas loaded');
		/// #endif
	}

	setRenderTarget() {
		const boundingBox = new Box3().setFromObject(this.ground.base.realMesh);
		boundingBox.min.z -= 0.5;
		boundingBox.max.z += 0.5;
		boundingBox.min.x -= 0.5;
		boundingBox.max.x += 0.5;
		boundingBox.max.y += 0.5;

		this.minBox.copy(boundingBox.min);
		this.maxBox.copy(boundingBox.max);

		this.boxCenter = new Vector3();
		boundingBox.getCenter(this.boxCenter);

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

		this.rtCamera.position.set(this.boxCenter.x, this.maxBox.y + camNear, this.boxCenter.z);

		this.rtCamera.rotation.x = -Math.PI * 0.5;

		this.renderTarget.depthTexture = this.depthTexture;
		this.renderTarget.depthTexture.format = DepthFormat;
		this.renderTarget.depthTexture.type = UnsignedShortType;

		requestAnimationFrame(this.updateRenderTarget);
	}

	setTerrainSplattingData() {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = this.terrainSplatting.source.data.width;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(this.terrainSplatting.source.data, 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		this.terrainSplattingData = imageData.data;
		canvas.remove();
	}

	addTo(mainScene) {
		mainScene.add(this.instance);
		this.player.setStartPosition(this.checkpoints.currentCheckpoint);

		this.player.broadphase.setGroundCollider(this.ground);
		if (this.collidersBroadphase)
			this.player.broadphase.setPropsColliders(this.collidersBroadphase.objectsToTest);
	}

	removeFrom(mainScene) {
		if (this.laserGames) this.laserGames.forEach((laserGame) => laserGame.reset());
		mainScene.remove(this.instance);
	}

	updateRenderTarget() {
		this.renderer.setRenderTarget(this.renderTarget);
		// Edit this to render only the Mesh/Group you want to test depth with
		this.renderer.render(this.ground.base.realMesh, this.rtCamera);
		this.renderer.setRenderTarget(null);

		/// #if DEBUG
		const buffer = new Uint8Array(this.renderTarget.width * this.renderTarget.height * 4);
		const planeGeo = new PlaneGeometry(2, 2);
		const planeMat = new MeshBasicMaterial({ map: this.depthTexture });
		const plane = new Mesh(planeGeo, planeMat);
		const ortho = new OrthographicCamera(-1, 1, 1, -1, -1, 1);
		const planeRT = new WebGLRenderTarget(this.renderTarget.width, this.renderTarget.width);
		this.renderer.setRenderTarget(planeRT);
		this.renderer.render(plane, ortho);

		this.renderer.readRenderTargetPixels(
			planeRT,
			0,
			0,
			this.renderTarget.width,
			this.renderTarget.height,
			buffer,
		);
		const data = new ImageData(this.renderTarget.width, this.renderTarget.height);
		data.data.set(buffer);

		this.canvasContext.putImageData(data, 0, 0);

		this.renderer.setRenderTarget(null);
		/// #endif
	}

	traverseForShadows() {
		// this.mainScene.traverse((child) => {
		// 	if (child.isMesh && child.name !== 'player') {
		// 		console.log(child.name);
		// 		child.castShadow = false;
		// 		// child.receiveShadow = false;
		// 	}
		// });
		this.directionalLight.light.shadow.autoUpdate = false;
		this.shadowsBaked = true;
	}

	update(et, dt) {
		if (!this.initialized) return;

		if (this.directionalLight && !this.shadowsBaked && et - this.currentTime > bakeDuration) {
			this.traverseForShadows();
		}

		if (this.portals)
			this.portals.forEach((portal) => portal.update(this.player.getPosition()));
		if (this.checkpoints) this.checkpoints.update(et, dt);
		if (this.laserGames) this.laserGames.forEach((laserGame) => laserGame.update(et, dt));
		if (this.areas) this.areas.update(et, dt);
		if (this.interactablesBroadphase)
			this.interactablesBroadphase.update(this.player.getPosition());
		if (this.collidersBroadphase) this.collidersBroadphase.update(this.player.getPosition());

		const playerXTexture = map(
			this.player.base.mesh.position.x,
			this.minBox.x,
			this.maxBox.x,
			0,
			this.terrainSplatting.source.data.width,
		);
		const playerYTexture = map(
			this.player.base.mesh.position.z,
			this.minBox.z,
			this.maxBox.z,
			0,
			this.terrainSplatting.source.data.width,
		);

		this.player.state.isOnGrass =
			this.terrainSplattingData.at(
				Math.floor(playerYTexture) * (this.terrainSplatting.source.data.width * 4) +
					Math.floor(playerXTexture) * 4 +
					1,
			) >= 100;
	}
}

import { store } from '@tools/Store';
import manifest from '@utils/manifest';
import { getWebgl } from '@webgl/Webgl';
import { AudioLoader, CubeTexture, CubeTextureLoader, Group, Texture, TextureLoader } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { loadGLTF } from './loadDynamicGLTF';

const basisLoader = new KTX2Loader();
let basisLoaderInit = false;
basisLoader.setTranscoderPath('/assets/decoder/basis/');

const textureLoader = new TextureLoader();
const audioLoader = new AudioLoader();
const cubeTextureLoader = new CubeTextureLoader();

/**
 *
 * @param {string} key
 * @returns {Promise<Texture | null>}
 */
export async function loadTexture(key) {
	const path = manifest.get(key)?.path;
	if (!path) {
		/// #if DEBUG
		console.error(`Texture ${key} not found`);
		/// #endif
		return;
	}
	let loader = textureLoader;
	if (path.includes('.ktx2')) {
		if (!basisLoaderInit) {
			detectBasisSupport();
		}
		loader = basisLoader;
	}

	let loadedTexture = store.loadedAssets.textures.get(key);
	if (!loadedTexture) {
		loadedTexture = await loader.loadAsync(path);
		store.loadedAssets.textures.set(key, loadedTexture);
	}
	return loadedTexture;
}

/**
 *
 * @param {string} key
 * @returns {Promise<CubeTexture | null>}
 */
export async function loadCubeTexture(key) {
	const path = manifest.get(key)?.path;
	if (!path) {
		/// #if DEBUG
		console.error(`Texture ${key} not found`);
		/// #endif
		return;
	}

	let loadedTexture = store.loadedAssets.textures.get(key);
	if (!loadedTexture) {
		if (Array.isArray(path) && path[0].includes('.ktx2')) {
			if (!basisLoaderInit) {
				detectBasisSupport();
			}
			console.log('loadCubeTexture', path);
			const textures = [];
			for (let i = 0; i < path.length; i++) {
				textures.push(await basisLoader.loadAsync(path[i]));
			}
			loadedTexture = new CubeTexture(textures);
			loadedTexture.minFilter = textures[0].minFilter;
			loadedTexture.magFilter = textures[0].magFilter;
			loadedTexture.format = textures[0].format;
			loadedTexture.encoding = textures[0].encoding;
			loadedTexture.type = textures[0].type;
			loadedTexture.needsUpdate = true;
			console.log(loadedTexture);
		} else loadedTexture = await cubeTextureLoader.loadAsync(path);

		store.loadedAssets.textures.set(key, loadedTexture);
	}
	return loadedTexture;
}

/**
 *
 * @param {string} key
 * @returns {Promise<AudioBuffer | null>}
 */
export async function loadAudio(key) {
	const path = manifest.get(key)?.path;
	if (!path) {
		/// #if DEBUG
		console.error(`Audio ${key} not found`);
		/// #endif
		return;
	}

	let loadedAudio = store.loadedAssets.audios.get(key);
	if (!loadedAudio) {
		loadedAudio = await audioLoader.loadAsync(path);
		store.loadedAssets.audios.set(key, loadedAudio);
	}

	return loadedAudio;
}

/**
 *
 * @param {string} key
 * @returns {Promise<Group | null>}
 */
export async function loadModel(key) {
	const path = manifest.get(key)?.path;
	if (!path) {
		/// #if DEBUG
		console.error(`Model ${key} not found`);
		/// #endif
		return;
	}

	let loadedModel = store.loadedAssets.models.get(key);
	if (!loadedModel) {
		let _loadedModel = await loadGLTF(path);
		_loadedModel = _loadedModel.scene;
		_loadedModel.traverse((child) => {
			if (child.isMesh) {
				loadedModel = child;
			}
		});
		store.loadedAssets.models.set(key, loadedModel);
	}

	return loadedModel.clone(true);
}

function detectBasisSupport() {
	basisLoader.detectSupport(getWebgl().renderer.renderer);
	basisLoaderInit = true;
}

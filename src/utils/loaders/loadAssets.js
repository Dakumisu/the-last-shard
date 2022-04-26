import { store } from '@tools/Store';
import manifest from '@utils/manifest';
import { getWebgl } from '@webgl/Webgl';
import { Group } from 'three';
import {
	AudioLoader,
	CubeTexture,
	CubeTextureLoader,
	LoadingManager,
	RGBAFormat,
	sRGBEncoding,
	Texture,
	TextureLoader,
} from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { loadGLTF } from './loadStaticGLTF';

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
		console.error('Texture key not found');
		/// #endif
		return;
	}
	let loader = textureLoader;
	if (path.includes('.ktx2')) {
		if (!basisLoaderInit) {
			basisLoader.detectSupport(getWebgl().renderer.renderer);
			basisLoaderInit = true;
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
		console.error('Texture key not found');
		/// #endif
		return;
	}

	let loadedTexture = store.loadedAssets.textures.get(key);
	if (!loadedTexture) {
		loadedTexture = await cubeTextureLoader.loadAsync(path);
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
		console.error('Audio key not found');
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

	// if (manifest.get(key).isLoading) await manifest.get(key).promise;

	let loadedModel = store.loadedAssets.models.get(key);
	if (!loadedModel) {
		loadedModel = await loadGLTF(path);
		store.loadedAssets.models.set(key, loadedModel);
	}

	return loadedModel.clone(true);
}

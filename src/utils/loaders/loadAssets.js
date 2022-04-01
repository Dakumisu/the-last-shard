import { store } from '@tools/Store';
import manifest from '@utils/manifest';
import { getWebgl } from '@webgl/Webgl';
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

const basisLoader = new KTX2Loader();
let basisLoaderInit = false;
basisLoader.setTranscoderPath('/assets/basis/');

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

	let loadedTexture = store.loadedAssets.textures.get(key);
	if (!loadedTexture) {
		loadedTexture = await textureLoader.loadAsync(path);
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
	if (!basisLoaderInit) {
		basisLoader.detectSupport(getWebgl().renderer.renderer);
		basisLoaderInit = true;
	}
	const path = manifest.get(key)?.path;
	if (!path) {
		/// #if DEBUG
		console.error('Texture key not found');
		/// #endif
		return;
	}

	let loadedTexture = store.loadedAssets.textures.get(key);
	if (!loadedTexture) {
		const textures = await Promise.all([
			textureLoader.loadAsync(path[0]),
			textureLoader.loadAsync(path[1]),
			textureLoader.loadAsync(path[2]),
			textureLoader.loadAsync(path[3]),
			textureLoader.loadAsync(path[4]),
			textureLoader.loadAsync(path[5]),
		]);

		loadedTexture = new CubeTexture(textures);

		// loadedTexture.minFilter = textures[0].minFilter;
		// loadedTexture.magFilter = textures[0].magFilter;
		// loadedTexture.format = textures[0].format;
		// loadedTexture.encoding = textures[0].encoding;

		// loadedTexture.needsUpdate = true;

		console.log(loadedTexture);

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

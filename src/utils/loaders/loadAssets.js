import { store } from '@tools/Store';
import manifest from '@utils/manifest';
import { getWebgl } from '@webgl/Webgl';
import {
	AudioLoader,
	CubeTexture,
	CubeTextureLoader,
	LoadingManager,
	Texture,
	TextureLoader,
} from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

const basisLoader = new KTX2Loader();
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
	basisLoader.detectSupport(getWebgl().renderer.renderer);
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
			basisLoader.loadAsync(path[0]),
			basisLoader.loadAsync(path[1]),
			basisLoader.loadAsync(path[2]),
			basisLoader.loadAsync(path[3]),
			basisLoader.loadAsync(path[4]),
			basisLoader.loadAsync(path[5]),
		]);
		loadedTexture = new CubeTexture(textures);

		loadedTexture.minFilter = textures[0].minFilter;
		loadedTexture.magFilter = textures[0].magFilter;
		loadedTexture.format = textures[0].format;
		loadedTexture.encoding = textures[0].encoding;

		loadedTexture.needsUpdate = true;
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

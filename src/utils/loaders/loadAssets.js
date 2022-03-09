import { store } from '@tools/Store';
import manifest from '@utils/manifest';
import { AudioLoader, LoadingManager, Texture, TextureLoader } from 'three';

const loadingManager = new LoadingManager();
// TODO => decide if an asset needs to be in the LoadingManager
// Or maybe create one LoadingManager for each scene (checking later...)

const textureLoader = new TextureLoader();
const audioLoader = new AudioLoader();

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

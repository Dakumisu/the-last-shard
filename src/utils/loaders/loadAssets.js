import manifest from '@utils/manifest';
import { AudioLoader, LoadingManager, Texture, TextureLoader } from 'three';

const loadingManager = new LoadingManager();
// TODO => decide if an asset need to be in the LoadingManager

const textureLoader = new TextureLoader();
const audioLoader = new AudioLoader();

/**
 *
 * @param {string} key
 * @returns {Promise<Texture>}
 */
export function loadTexture(key) {
	const path = manifest.get(key);
	if (!path) {
		console.error('Texture key not found');
		return;
	}
	return textureLoader.loadAsync(path);
}

/**
 *
 * @param {string} key
 * @returns {Promise<AudioBuffer>}
 */
export function loadAudio(key) {
	const path = manifest.get(key);
	if (!path) {
		console.error('Audio key not found');
		return;
	}
	return audioLoader.loadAsync(path);
}

import { store } from '@tools/Store';
import manifest from '@utils/manifest';
import { getWebgl } from '@webgl/Webgl';
import {
	AudioLoader,
	CubeTexture,
	CubeTextureLoader,
	Group,
	sRGBEncoding,
	Texture,
	TextureLoader,
} from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader';
import { loadGLTF } from './loadDynamicGLTF';

const basisLoader = new KTX2Loader();
let basisLoaderInit = false;
basisLoader.setTranscoderPath('/assets/decoder/basis/');

const textureLoader = new TextureLoader();
const lutCubeLoader = new LUTCubeLoader();
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
		// loadedTexture.encoding = sRGBEncoding;
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
 * @returns {Promise< Texture | null>}
 */
export async function loadLUTTexture(key) {
	const path = manifest.get(key)?.path;
	if (!path) {
		/// #if DEBUG
		console.error(`LUT Cube ${key} not found`);
		/// #endif
		return;
	}

	let loadedTexture = store.loadedAssets.textures.get(key);
	if (!loadedTexture) {
		loadedTexture = (await lutCubeLoader.loadAsync(path)).texture;

		store.loadedAssets.textures.set(key, loadedTexture);
	}
	return loadedTexture;
}

/**
 *
 * @param {string} key
 * @returns {Promise<String | null>}
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
		const arrayBuffer = await (await fetch(new Request(path))).arrayBuffer();
		const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
		loadedAudio = URL.createObjectURL(blob);
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
	let loadedModel;
	if (path.includes('Scene_')) {
		loadedModel = (await loadGLTF(path)).scene;
	} else {
		loadedModel = store.loadedAssets.models.get(key);
		if (!loadedModel) {
			loadedModel = (await loadGLTF(path)).scene;
			store.loadedAssets.models.set(key, loadedModel);
		}
	}
	loadedModel.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
	return loadedModel.clone(true);
}

function detectBasisSupport() {
	basisLoader.detectSupport(getWebgl().renderer.renderer);
	basisLoaderInit = true;
}

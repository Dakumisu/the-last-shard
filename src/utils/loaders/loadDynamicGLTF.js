import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { MeshoptDecoder } from 'meshoptimizer/meshopt_decoder.module';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/assets/decoder/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

export async function loadGLTF(url, opts = {}) {
	return new Promise((resolve, reject) => {
		gltfLoader.load(
			url,
			(data) => {
				if (opts.onLoad) opts.onLoad(data);
				resolve(data);
			},
			() => {},
			reject,
		);
	});
}

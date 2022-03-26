import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer/meshopt_decoder.module';

const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

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

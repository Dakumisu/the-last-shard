import { Matrix4 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Mesh } from 'three';
// import { MeshoptDecoder } from 'meshoptimizer/meshopt_decoder.module';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/assets/decoder/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
// gltfLoader.setMeshoptDecoder(MeshoptDecoder);

async function loadGLTF(url, opts = {}) {
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

onmessage = async function (e) {
	const url = e.data.url;

	const { attributes, buffers } = await getModelGeometryAttributes(url);

	postMessage(
		{
			attributes: attributes,
		},
		[...new Set(buffers)],
	);
};

async function getModelGeometryAttributes(url) {
	const _m = await loadGLTF(url);
	const _a = await parseModel(_m);
	return _a;
}

async function parseModel(model) {
	const attributes = [];
	const buffers = [];
	const mat4 = new Matrix4();

	let name = '';

	await model.scene.traverse((mesh, i) => {
		if (mesh.name && mesh instanceof Mesh) name = mesh.name;

		if (mesh.geometry) {
			const geo = mesh.geometry;

			mesh.updateWorldMatrix(true, false);
			mat4.multiplyMatrices(mesh.matrixWorld, mesh.matrix);
			geo.applyMatrix4(mesh.matrixWorld);

			let index = geo.index.array;
			let pos = geo.attributes.position.array;
			let normal = geo.attributes.normal.array;
			let uv = geo.attributes.uv.array;

			const geoAttributes = { index, pos, normal, uv, name };

			buffers.push(index.buffer);
			buffers.push(pos.buffer);
			buffers.push(normal.buffer);
			buffers.push(uv.buffer);

			attributes.push(geoAttributes);
		}
	});

	return { attributes, buffers };
}

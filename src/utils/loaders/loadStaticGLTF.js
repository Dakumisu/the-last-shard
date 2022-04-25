import {
	BufferAttribute,
	BufferGeometry,
	DoubleSide,
	Group,
	Mesh,
	MeshNormalMaterial,
} from 'three';

import wLoadGLTF from '@workers/wLoadGLTF?worker';

export async function loadGLTF(model) {
	const _g = await load(model);
	const geometries = [..._g];
	const _m = await setMesh(geometries);

	return _m;
}

async function load(src) {
	const worker = wLoadGLTF();

	const geometries = [];

	return new Promise((resolve) => {
		worker.postMessage({
			url: src,
		});

		worker.addEventListener('message', (e) => {
			const geo = e.data.attributes;

			geo.forEach((attributes) => {
				const bufferGeo = new BufferGeometry();

				// Conversion des attributes du model en geometry
				bufferGeo.setIndex(new BufferAttribute(attributes.index, 1, false));
				bufferGeo.setAttribute('position', new BufferAttribute(attributes.pos, 3, false));
				bufferGeo.setAttribute('normal', new BufferAttribute(attributes.normal, 3, false));
				bufferGeo.setAttribute('uv', new BufferAttribute(attributes.uv, 2, false));

				geometries.push(bufferGeo);
			});

			worker.terminate();
			resolve(geometries);
		});
	});
}

async function setMesh(geometries) {
	const group = new Group();

	const material = new MeshNormalMaterial({
		side: DoubleSide,
	});

	await geometries.forEach((geometry) => {
		const mesh = new Mesh(geometry, material);
		mesh.frustumCulled = false;

		group.add(mesh);
	});

	return group;
}

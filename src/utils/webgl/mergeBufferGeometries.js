import { BufferAttribute, BufferGeometry, Matrix4, Object3D } from 'three';

import wMergeGeo from '@workers/wMergeGeo?worker';

import { loadStaticGLTF as loadGLTF } from '@utils/loaders';

export function mergeGeometry(geos = [], models = []) {
	const geometries = [];

	return new Promise(async (resolve) => {
		if (!geos.length && !models.length) {
			console.error('Geometries required 🚫');
			resolve(null);
		}

		geometries.push(...geos);

		if (models.length) {
			await loadModels(models, geometries);
			geometriesFilter(geometries);
			const g = await mergeGeometries(geometries);
			resolve(g);
		} else {
			geometriesFilter(geometries);
			const g = await mergeGeometries(geometries);
			resolve(g);
		}
	});
}

function geometriesFilter(geometries) {
	let count = geometries.length;

	for (let i = 0; i < count; i++) {
		const element = geometries[i];

		if (element instanceof Object3D) {
			const geos = [];

			element.traverse((child) => {
				if (child.geometry) {
					const mat4 = new Matrix4();

					child.updateWorldMatrix(true, false);
					mat4.multiplyMatrices(child.matrixWorld, child.matrix);
					child.geometry.applyMatrix4(child.matrixWorld);

					geos.push(child.geometry);
				}
			});

			geometries.splice(i, 1, ...geos);
			i += geos.length - 1;
			count += geos.length - 1;
		}
	}
}

async function loadModels(models, geometries) {
	let count = 0;

	return new Promise((resolve) => {
		models.forEach((modelSrc) => {
			loadGLTF(modelSrc).then((response) => {
				geometries.push(response);

				count++;
				if (count === models.length) {
					resolve(geometries);
				}
			});
		});
	});
}

function mergeGeometries(geometries) {
	return new Promise((resolve) => {
		mergeBufferGeometries([...geometries]).then((response) => {
			geometries.forEach((geometry) => {
				geometry.dispose();
				geometries = [];
			});

			resolve(response);
		});
	});
}

function mergeBufferGeometries(datas) {
	const worker = new wMergeGeo();

	const bufferGeometries = [];
	const buffers = [];

	for (let i = 0; i < datas.length; i++) {
		bufferGeometries[i] = {};
		bufferGeometries[i].index = datas[i].index.array;
		bufferGeometries[i].position = datas[i].attributes.position.array;
		bufferGeometries[i].normal = datas[i].attributes.normal.array;
		bufferGeometries[i].uv = datas[i].attributes.uv.array;

		buffers.push(datas[i].index.array.buffer);
		buffers.push(datas[i].attributes.position.array.buffer);
		buffers.push(datas[i].attributes.normal.array.buffer);
		buffers.push(datas[i].attributes.uv.array.buffer);
	}

	return new Promise((resolve) => {
		worker.postMessage(
			{
				geometries: bufferGeometries,
			},
			[...new Set(buffers)],
		);

		worker.addEventListener('message', (response) => {
			const attributes = response.data;

			const bufferGeo = new BufferGeometry();

			// Conversion des attributes mergés en geometry
			bufferGeo.setIndex(new BufferAttribute(attributes.index, 1, false));
			bufferGeo.setAttribute('position', new BufferAttribute(attributes.pos, 3, false));
			bufferGeo.setAttribute('normal', new BufferAttribute(attributes.normal, 3, false));
			bufferGeo.setAttribute('uv', new BufferAttribute(attributes.uv, 2, false));

			worker.terminate();
			resolve(bufferGeo);
		});
	});
}

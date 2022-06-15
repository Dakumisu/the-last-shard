import { Vector3, CurvePath, CatmullRomCurve3, CubicBezierCurve3 } from 'three';

function catmullPath(blenderPath, { closed = false, curveType, tension, uid = '' } = {}) {
	const vertices = blenderPath.map((pts) => new Vector3().fromArray(pts));
	const curve = new CatmullRomCurve3(vertices, closed, curveType, tension);
	curve.uid = uid;
	return curve;
}

function beziersPath(blenderBeziers, { closed = false, uid = '' } = {}) {
	const curve = new CurvePath();
	curve.uid = uid;

	for (let i = 0, l = blenderBeziers.length; i < l; i++) {
		// Le cubic bezier demande 4 valeurs alors que blender exporte une curve à 3 valeurs
		// ([control, left, right])
		// Seulement ça ne représente pas la courbe, mais seulement les points de control
		// On build la courbe en lui donnant un 1er point et celui qui suit, avec un de leur control
		const startPoint = blenderBeziers[i];

		let endPoint;
		if (closed) {
			endPoint = blenderBeziers[(i + 1) % l];
		} else {
			if (blenderBeziers[i + 1] === undefined) continue;

			endPoint = blenderBeziers[i + 1];
		}

		curve.add(
			new CubicBezierCurve3(
				new Vector3().fromArray(startPoint, 0),
				new Vector3().fromArray(startPoint, 6),
				new Vector3().fromArray(endPoint, 3),
				new Vector3().fromArray(endPoint, 0),
			),
		);
	}

	if (closed) curve.closePath();

	return curve;
}

export { catmullPath, beziersPath };

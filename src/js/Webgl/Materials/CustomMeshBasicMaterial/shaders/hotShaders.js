import { hotMaterial } from 'philbin-packages/webgl';

import vs from './defaultVertex.glsl';
import fs from './defaultFragment.glsl';

let hmr = false;
/// #if DEBUG
hmr = true;
/// #endif

export default hotMaterial(
	vs,
	fs,
	(update) => {
		if (import.meta.hot) import.meta.hot.accept(update);
	},
	hmr,
);

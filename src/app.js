import '@scss/main.scss';

import signal from 'philbin-packages/signal';

import { initDom } from '@dom/Dom';
import { initWebgl } from '@webgl/Webgl';
import { initGame } from '@game/Game';
import { loadManifestAssets } from '@utils/manifest';

const dom = initDom();

signal.once('domLoaded', async () => {
	await loadManifestAssets();
	const game = initGame();
	const webgl = initWebgl(dom.nodes.domElements.canvas);
});

/// #if DEBUG
console.log('Debug mode 🔥');
/// #endif

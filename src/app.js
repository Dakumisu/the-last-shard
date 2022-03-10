import '@scss/main.scss';

import signal from 'signal-js';

import Dom from '@dom/Dom';
import { initGame } from '@game/Game';
import { initWebgl } from '@webgl/Webgl';

const dom = new Dom();

signal.once('load', () => {
	const webgl = initWebgl(dom.nodes.domElements.canvas);
	const game = initGame();
});

/// #if DEBUG
console.log('debug mode 🔥');
/// #endif

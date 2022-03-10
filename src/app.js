import '@scss/main.scss';

import signal from 'signal-js';

import Dom from '@dom/Dom';
import { getGame } from '@game/Game';
import { getWebgl } from '@webgl/Webgl';

const dom = new Dom();

signal.once('load', () => {
	const webgl = getWebgl(dom.nodes.domElements.canvas);
	const game = getGame();
});

/// #if DEBUG
console.log('debug mode 🔥');
/// #endif

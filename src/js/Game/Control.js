import signal from 'philbin-packages/signal';

import { getGame } from './Game';

const movementKey = {
	forward: 'Z',
	left: 'Q',
	backward: 'S',
	right: 'D',
	space: 'SPACE',
	shift: 'SHIFT',
};

export default class Control {
	constructor() {
		const game = getGame();
		const keyboard = game.keyboard;

		signal.on('keydown', (key) => {
			this.keyDown(key);
		});
		signal.on('keyup', (key) => {
			this.keyUp(key);
		});

		this.keyPressed = {
			forward: false,
			left: false,
			backward: false,
			right: false,
			space: false,
			shift: false,
		};
	}

	keyDown(key) {
		switch (key) {
			case movementKey.forward:
				this.keyPressed.forward = true;
				break;
			case movementKey.backward:
				this.keyPressed.backward = true;
				break;
			case movementKey.right:
				this.keyPressed.right = true;
				break;
			case movementKey.left:
				this.keyPressed.left = true;
				break;
			case movementKey.space:
				this.keyPressed.space = true;
				break;
			case movementKey.shift:
				this.keyPressed.shift = true;
				break;
		}
	}

	keyUp(key) {
		switch (key) {
			case movementKey.forward:
				this.keyPressed.forward = false;
				break;
			case movementKey.backward:
				this.keyPressed.backward = false;
				break;
			case movementKey.right:
				this.keyPressed.right = false;
				break;
			case movementKey.left:
				this.keyPressed.left = false;
				break;
			case movementKey.space:
				this.keyPressed.space = false;
				break;
			case movementKey.shift:
				this.keyPressed.shift = false;
				break;
		}
	}
}

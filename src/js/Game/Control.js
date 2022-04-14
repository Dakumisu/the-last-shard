import signal from 'philbin-packages/signal';

import { getGame } from './Game';

const controlsKey = {
	forward: 'Z',
	left: 'Q',
	backward: 'S',
	right: 'D',
	space: 'SPACE',
	shift: 'SHIFT',
	interact: 'F',
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
			interact: false,
		};
	}

	keyDown(key) {
		switch (key) {
			case controlsKey.forward:
				this.keyPressed.forward = true;
				break;
			case controlsKey.backward:
				this.keyPressed.backward = true;
				break;
			case controlsKey.right:
				this.keyPressed.right = true;
				break;
			case controlsKey.left:
				this.keyPressed.left = true;
				break;
			case controlsKey.space:
				this.keyPressed.space = true;
				break;
			case controlsKey.shift:
				this.keyPressed.shift = true;
				break;
			case controlsKey.interact:
				this.keyPressed.interact = true;
				signal.emit('interact');
				break;
		}
	}

	keyUp(key) {
		switch (key) {
			case controlsKey.forward:
				this.keyPressed.forward = false;
				break;
			case controlsKey.backward:
				this.keyPressed.backward = false;
				break;
			case controlsKey.right:
				this.keyPressed.right = false;
				break;
			case controlsKey.left:
				this.keyPressed.left = false;
				break;
			case controlsKey.space:
				this.keyPressed.space = false;
				break;
			case controlsKey.shift:
				this.keyPressed.shift = false;
				break;
			case controlsKey.interact:
				this.keyPressed.interact = false;
				break;
		}
	}
}

import signal from 'philbin-packages/signal';

import { getGame } from './Game';

export const controlsKeys = {
	forward: 'Z',
	left: 'Q',
	backward: 'S',
	right: 'D',
	space: 'SPACE',
	escape: 'ESCAPE',
	shift: 'SHIFT',
	interact: 'F',
	rotate: ['A', 'E'],
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
			escape: false,
			shift: false,
			interact: false,
			rotate: false,
		};
	}

	keyDown(key) {
		switch (key) {
			case controlsKeys.forward:
				this.keyPressed.forward = true;
				break;
			case controlsKeys.backward:
				this.keyPressed.backward = true;
				break;
			case controlsKeys.right:
				this.keyPressed.right = true;
				break;
			case controlsKeys.left:
				this.keyPressed.left = true;
				break;
			case controlsKeys.space:
				this.keyPressed.space = true;
				break;
			case controlsKeys.escape:
				this.keyPressed.escape = true;
				break;
			case controlsKeys.shift:
				this.keyPressed.shift = true;
				break;
			case controlsKeys.interact:
				this.keyPressed.interact = true;
				signal.emit('user:interact', key);
				break;
			case controlsKeys.rotate[0]:
				this.keyPressed.rotate = true;
				signal.emit('user:interact', key);
				break;
			case controlsKeys.rotate[1]:
				this.keyPressed.rotate = true;
				signal.emit('user:interact', key);
				break;
		}
	}

	keyUp(key) {
		switch (key) {
			case controlsKeys.forward:
				this.keyPressed.forward = false;
				break;
			case controlsKeys.backward:
				this.keyPressed.backward = false;
				break;
			case controlsKeys.right:
				this.keyPressed.right = false;
				break;
			case controlsKeys.left:
				this.keyPressed.left = false;
				break;
			case controlsKeys.space:
				this.keyPressed.space = false;
				break;
			case controlsKeys.escape:
				this.keyPressed.escape = false;
				break;
			case controlsKeys.shift:
				this.keyPressed.shift = false;
				break;
			case controlsKeys.interact:
				this.keyPressed.interact = false;
				break;
			case controlsKeys.rotate[0]:
				this.keyPressed.rotate = false;
				break;
			case controlsKeys.rotate[1]:
				this.keyPressed.rotate = false;
				break;
		}
	}
}

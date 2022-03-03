import { getGame } from './Game';

import Emmitter from '@tools/Emitter';

const movementKey = {
	forward: 'Z',
	left: 'Q',
	backward: 'S',
	right: 'D',
	space: 'SPACE',
};
const keyPressed = {
	forward: false,
	left: false,
	backward: false,
	right: false,
	space: false,
};

export default class Control extends Emmitter {
	constructor() {
		super();

		const game = getGame();
		const keyboard = game.keyboard;

		keyboard.on('keydown', (key) => {
			console.log(`keydown ${key}`);
			this.keyDown(key);
		});
		keyboard.on('keyup', (key) => {
			console.log(`keyup ${key}`);
			this.keyUp(key);
		});
	}

	keyDown(key) {
		switch (key) {
			case movementKey.forward:
				keyPressed.forward = true;
				break;
			case movementKey.backward:
				keyPressed.backward = true;
				break;
			case movementKey.right:
				keyPressed.right = true;
				break;
			case movementKey.left:
				keyPressed.left = true;
				break;
			case movementKey.space:
				keyPressed.space = true;
				// if ( playerIsOnGround ) {

				// 	playerVelocity.y = 10.0;

				// }

				break;
		}
	}

	keyUp(key) {
		switch (key) {
			case movementKey.forward:
				keyPressed.forward = false;
				break;
			case movementKey.backward:
				keyPressed.backward = false;
				break;
			case movementKey.right:
				keyPressed.right = false;
				break;
			case movementKey.left:
				keyPressed.left = false;
				break;
		}
	}
}

import { loadAudio } from '@utils/loaders';
import { getPlayer } from '@webgl/World/Characters/Player';
import { Howl, Howler } from 'howler';
import { deferredPromise, wait } from 'philbin-packages/async';
import signal from 'philbin-packages/signal';

export default class SoundController {
	constructor() {
		/**
		 * @type {Object.<string, {howl: Howl, params: Object}>}
		 */
		this.sounds = {};

		this.player = getPlayer();

		signal.on('sound:play', this.play);
		signal.on('sound:stop', this.pause);

		this.isLoaded = deferredPromise();
		this.init();
	}

	async init() {
		await Promise.all([
			this.add('laser', { loop: true, fadeDuration: 500, rate: 1 }),
			this.add('laser-rotate', { loop: false, rate: 1 }),
			this.add('laser-activate', { loop: false, rate: 1 }),
			this.add('footsteps', { loop: true, fadeDuration: 50, rate: 1 }),
			this.add('fall', { loop: false, rate: 1 }),
			this.add('jump', { loop: false, rate: 1 }),
		]);
		this.isLoaded.resolve();
	}

	async add(key, params) {
		this.sounds[key] = {
			howl: new Howl({
				src: [await loadAudio(key + '-sound')],
				format: ['mp3'],
				loop: params.loop,
				rate: params.rate,
				volume: params.volume,
			}),
			params,
		};

		console.log(this.sounds);
	}

	remove(key) {}

	play = (key, params = {}) => {
		const sound = this.sounds[key];

		if (params.pos) sound.howl.pos(params.pos.x, params.pos.y, params.pos.z);
		if (params.rate) sound.howl.rate(Math.max(params.rate || 1, sound.params.rate));

		if (!params.replay && sound.howl.playing()) return;

		if (sound.params.fadeDuration)
			sound.howl.fade(sound.howl.volume(), 1, sound.params.fadeDuration);

		sound.howl.play();
	};

	pause = async (key) => {
		const sound = this.sounds[key];
		if (!sound.howl.playing()) return;

		if (sound.params.fadeDuration) {
			sound.howl.fade(sound.howl.volume(), 0, sound.params.fadeDuration);
			await wait(sound.params.fadeDuration);
		}
		sound.howl.pause();
	};

	update() {
		if (this.player?.base.mesh.position)
			Howler.pos(
				this.player.base.mesh.position.x,
				this.player.base.mesh.position.y,
				this.player.base.mesh.position.z,
			);
	}

	destroy() {
		signal.off('sound:play', this.play);
		signal.off('sound:stop', this.pause);
	}
}

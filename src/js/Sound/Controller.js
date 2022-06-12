import { loadAudio } from '@utils/loaders';
import { getPlayer } from '@webgl/World/Characters/Player';
import { Howl, Howler } from 'howler';
import { deferredPromise, wait } from 'philbin-packages/async';
import signal from 'philbin-packages/signal';

export default class SoundController {
	constructor() {
		Howler.volume(0.5);
		/**
		 * @type {Object.<string, {howl: Howl, params: Object}>}
		 */
		this.sounds = {};
		/**
		 * @type {Object.<string, Howl>}
		 */
		this.ambients = {};

		this.player = getPlayer();

		signal.on('sound:play', this.play);
		signal.on('sound:stop', this.pause);
		signal.on('sound:setParams', this.setParams);
		signal.on('sound:beforeSwitch', this.beforeSwitch);
		signal.on('sound:afterSwitch', this.afterSwitch);

		this.isLoaded = deferredPromise();
		this.init();
	}

	async init() {
		await Promise.all([
			this.add('laser', { loop: true, fadeDuration: 500, rate: 1 }),
			this.add('laser-rotate', { loop: false, rate: 1 }),
			this.add('laser-activate', { loop: false, rate: 1 }),
			this.add('checkpoint', { loop: false, rate: 1 }),
			this.add('timer', { loop: true, rate: 1 }),
			this.add('footsteps-grass', { loop: true, fadeDuration: 50, rate: 1 }),
			this.add('footsteps-ground', { loop: true, fadeDuration: 50, rate: 1 }),
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
	}

	async addAmbient(sceneName) {
		this.ambients[sceneName] = new Howl({
			src: [await loadAudio('Scene_' + sceneName + '-sound')],
			format: ['mp3'],
			loop: true,
		});
	}

	play = (key, params = {}) => {
		const sound = this.sounds[key];

		if (params.pos) sound.howl.pos(params.pos.x, params.pos.y, params.pos.z);
		if (params.rate) sound.howl.rate(Math.max(params.rate || 1, sound.params.rate));
		if (params.volume) sound.howl.volume(params.volume);
		if (!params.replay && sound.howl.playing()) return;

		if (sound.params.fadeDuration)
			sound.howl.fade(sound.howl.volume(), 1, sound.params.fadeDuration);

		sound.howl.play();
	};

	pause = (key) => {
		const sound = this.sounds[key];
		if (!sound.howl.playing()) return;

		if (sound.params.fadeDuration)
			sound.howl
				.fade(sound.howl.volume(), 0, sound.params.fadeDuration)
				.once('fade', () => this.sounds[key].howl.pause());
		else sound.howl.pause();
	};

	setParams = (key, params) => {
		const sound = this.sounds[key];
		if (!sound) return;

		if (params.volume) sound.howl.volume(params.volume);
		if (params.rate) sound.howl.rate(params.rate);
	};

	beforeSwitch = (sceneName) => {
		for (const key in this.sounds)
			this.sounds[key].howl
				.fade(this.sounds[key].howl.volume(), 0, 500)
				.once('fade', () => this.sounds[key].howl.pause());

		this.ambients[sceneName]
			.fade(1, 0, 500)
			.once('fade', () => this.ambients[sceneName].stop());
	};

	afterSwitch = (sceneName) => {
		this.ambients[sceneName].fade(0, 1, 500).play();
	};

	update() {
		if (this.player?.base.mesh.position) {
			Howler.pos(
				this.player.base.mesh.position.x,
				this.player.base.mesh.position.y,
				this.player.base.mesh.position.z,
			);
			Howler.orientation(
				this.player.base.mesh.rotation.x,
				this.player.base.mesh.rotation.y,
				this.player.base.mesh.rotation.z,
			);
		}
	}

	destroy() {
		signal.off('sound:play', this.play);
		signal.off('sound:stop', this.pause);
		signal.off('sound:setParams', this.setParams);
		signal.off('sound:beforeSwitch', this.beforeSwitch);
		signal.off('sound:afterSwitch', this.afterSwitch);
	}
}

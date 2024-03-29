import signal from 'philbin-packages/signal';

import { store } from '@tools/Store';

export default class Nodes {
	constructor() {
		window.addEventListener('DOMContentLoaded', async () => {
			await this.getNodes();
			await this.getShadowNodes();

			signal.emit('dom:complete');
		});
	}

	async getNodes() {
		if (this.domElements) return this.domElements;

		this.domRef = [...document.querySelectorAll('[data-ref]')];
		this.domElements = {};

		await new Promise((resolve) => {
			for (const key in this.domRef) {
				if (this.domElements[this.domRef[key].dataset.ref])
					this.domElements[this.domRef[key].dataset.ref].push(this.domRef[key]);
				else this.domElements[this.domRef[key].dataset.ref] = [this.domRef[key]];
			}

			resolve();
		});

		await new Promise((resolve) => {
			for (const key in this.domElements) {
				if (this.domElements[key].length === 1) {
					const tmpValue = this.domElements[key][0];
					this.domElements[key] = tmpValue;
				}
			}

			resolve(this.domElements);
		});
	}

	async getShadowNodes() {
		if (this.shadowElements) return this.shadowElements;

		this.shadowElements = {};

		await new Promise((resolve) => {
			for (const key in this.domElements) {
				if (this.domElements[key].shadowRoot) {
					const parent = this.domElements[key];
					const parentName = this.domElements[key].dataset.ref;

					this.shadowElements[parentName] = {};

					this.shadowRef = [...parent.shadowRoot.querySelectorAll('[data-ref]')];

					for (const key in this.shadowRef) {
						if (this.shadowElements[parentName][this.shadowRef[key].dataset.ref])
							this.shadowElements[parentName][this.shadowRef[key].dataset.ref].push(
								this.shadowRef[key],
							);
						else
							this.shadowElements[parentName][this.shadowRef[key].dataset.ref] = [
								this.shadowRef[key],
							];
					}
				}
			}

			resolve();
		});

		await new Promise((resolve) => {
			for (const key in this.shadowElements) {
				const parent = this.shadowElements[key];
				for (const key in parent) {
					if (parent[key].length === 1) {
						const tmpValue = parent[key][0];
						parent[key] = tmpValue;
					}
				}
			}

			resolve(this.shadowElements);
		});
	}

	deleteNode(node) {
		delete this.domElements[node];
		delete this.shadowElements[node];
	}

	destroy() {
		delete this.domRef;
		delete this.shadowRef;
		delete this.domElements;
		delete this.shadowElements;
	}

	async reset() {
		this.destroy();

		await this.getNodes();
		await this.getShadowNodes();
	}
}

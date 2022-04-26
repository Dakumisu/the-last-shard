import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import * as TweakpaneRotationInputPlugin from '@0b5vr/tweakpane-plugin-rotation';
import StatsJs from '@tools/Stats';
/// #if DEBUG
import signal from 'philbin-packages/signal';
/// #endif

let tabList = ['General', 'Player', 'Scene', 'Env', 'Stats'];

export default class Debug {
	constructor() {
		this.gui = new Pane();
		this.gui.registerPlugin(EssentialsPlugin); // https://cocopon.github.io/tweakpane/plugins.html
		this.gui.registerPlugin(TweakpaneRotationInputPlugin); // https://www.npmjs.com/package/@0b5vr/tweakpane-plugin-rotation
		this.stats = new StatsJs();

		this.debugFolders = {};
		this.tabs = {};

		this.initTab();

		this.gui.hidden = localStorage.getItem('debug_hide');
		signal.on('keyup', (key) => {
			if (key !== 'H') return;
			this.gui.hidden = !this.gui.hidden;
			localStorage.setItem('debug_hide', this.gui.hidden);
		});
	}

	setFolder(folderLabel, tabLabel = tabList[0], expanded = true) {
		const fl = folderLabel.toLowerCase();
		const tl = tabLabel.toLowerCase();
		const tab = this.getTab(tl);
		this.debugFolders[fl] = tab.addFolder({
			title: folderLabel,
			expanded: expanded,
		});
	}

	getFolder(folderLabel) {
		const fl = folderLabel.toLowerCase();
		return this.debugFolders[fl];
	}

	initTab() {
		const pages = [];
		tabList.forEach((tab) => {
			pages.push({ title: tab });
		});
		tabList = tabList.map((t) => t.toLowerCase());

		this.tabs = this.gui.addTab({
			pages: pages,
		});
	}

	getTab(tabLabel, folderLabel) {
		const tl = tabLabel.toLowerCase();
		const checkIndex = tabList.indexOf(tl);
		if (checkIndex == -1)
			console.warn(
				`Tab '${tabLabel}' doesn't exist ❗️ \n Setting folder in tab 'General' per default`,
			);

		const index = checkIndex == -1 ? 0 : checkIndex;
		return this.tabs.pages[index];
	}

	destroy() {
		this.gui.dispose();
		this.stats.destroy();
	}
}

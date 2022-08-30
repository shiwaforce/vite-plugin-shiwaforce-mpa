const path = require('path');
const mime = require('mime-types');
const fs = require('fs');

let Config;

function resolver(from, to) {
	return path.resolve(from, to);
}

function getPageRoots() {
	const roots = [];
	const { pageDir } = Config;

	fs.readdirSync(resolver(Config.root, pageDir)).forEach(page => {
		roots.push(resolver(Config.root, `${pageDir}${path.sep}${page}${path.sep}${page}.html`));
	});

	return roots;
}

function getPageNames() {
	const pageNames = [];
	const { pageDir } = Config;
	fs.readdirSync(resolver(Config.root, pageDir)).forEach(page => {
		pageNames.push(page);
	});
	return pageNames;
}

function rewritePages() {
	const rules = [];
	const { pageDir, pageName, mimeCheck, defaultPageName } = Config;

	fs.readdirSync(resolver(Config.root, pageDir)).forEach(page => {
		rules.push({
			from: new RegExp(`^/${page}/${pageName}$`),
			to: `/${pageDir}/${page}/${page}.html`
		});
		rules.push({
			from: new RegExp(`^/${page}.html$`),
			to: `/${pageDir}/${page}/${page}.html`
		});
		rules.push({
			from: new RegExp(`^/${page}$`),
			to: `/${pageDir}/${page}/${page}.html`
		});
		rules.push({
			from: new RegExp(`^/${page}/$`),
			to: `/${pageDir}/${page}/${page}.html`
		});
	});
	if (!Config.interceptor) {
		rules.push({
			from: new RegExp('^\/$'),
			to: `/${pageDir}/${defaultPageName}.html`
		});
		rules.push({
			from: new RegExp('^$'),
			to: `/${pageDir}/${defaultPageName}.html`
		});
	}

	return (req, res, next) => {
		if (Config.interceptor) {
			Config.interceptor(req, res, next);
		}
		const name = req.url;

		if (mimeCheck) {
			res.setHeader('Content-Type', mime.lookup(name));
		}
		for (const rule in rules) {
			if (name.match(rules[rule].from)) {
				req.url = rules[rule].to;
				res.statusCode = 302;
				break;
			}
		}

		return next();
	};
}

module.exports = (interceptor = null, addServerConfiguration = [], userConfig = {}) => {
	const defaultConfig = {
		pageDir: 'pages',
		pageName: 'index.html',
		mimeCheck: true,
		...userConfig
	};

	return {
		name: 'vite-plugin-shiwaforce-mpa',
		enforce: 'pre',

		config(config) {
			Config = config;
			config.root = config.root || process.cwd();
			config.defaultPageName = 'index';
			config.pageDir = defaultConfig.pageDir;
			config.removePageDirs = defaultConfig.removePageDirs;
			config.pageName = defaultConfig.pageName;
			config.pageNames = getPageNames();
			config.mimeCheck = defaultConfig.mimeCheck;
			config.server = config.server || {};
			config.build = config.build || {};
			config.build.outDir = config.build.outDir || 'dist';
			config.build.rollupOptions = config.build.rollupOptions || {};
			config.build.rollupOptions.input = getPageRoots();
			config.interceptor = interceptor;
			config.serverConfigurations = addServerConfiguration;
		},

		configureServer({ middlewares: app }) {
			const { serverConfigurations } = Config;
			for (let i = 0; i < serverConfigurations.length; i++) {
				app.use(serverConfigurations[i]());
			}
			app.use(rewritePages());
		},

		writeBundle() {
			const { pageDir, pageNames } = Config;
			// Change html-s to relative paths
			fs.readdirSync(resolver(Config.build.outDir, pageDir)).forEach(page => {
				const currentPagePlace = resolver(Config.build.outDir, `${pageDir}${path.sep}${page}${path.sep}${page}.html`);
				const data = fs.readFileSync(currentPagePlace, 'utf8');
				const result = data.replace(/[=]"\//g, '="/static/' + page + '/');
				fs.writeFileSync(currentPagePlace, result, 'utf8');
			});


			// Rename page.html to index.html
			fs.readdirSync(resolver(Config.build.outDir, pageDir)).forEach(page => {
				const currentPagePlace = resolver(Config.build.outDir, `${pageDir}${path.sep}${page}${path.sep}${page}.html`);
				const newPagePlace = resolver(Config.build.outDir, `${pageDir}${path.sep}${page}${path.sep}index.html`);
				fs.renameSync(currentPagePlace, newPagePlace);
			});

			// Move files to proper directory
			fs.readdirSync(resolver(Config.build.outDir, '.')).forEach(file => {
				const filePath = resolver(Config.build.outDir, file);
				if (!fs.lstatSync(filePath).isDirectory()) {
					const fileName = file.split('.')[0];
					const matchedPageIndex = pageNames.indexOf(fileName);
					const hasPageMatch = matchedPageIndex > -1;
					const moveFolder = pageNames[matchedPageIndex];
					if (hasPageMatch) {
						// Move files
						const newFilePlace = resolver(Config.build.outDir, `${pageDir}${path.sep}${moveFolder}${path.sep}${file}`);
						fs.renameSync(filePath, newFilePlace);
					} else {
						// Copy files
						for (const pageName of pageNames) {
							const newFilePlace = resolver(Config.build.outDir, `${pageDir}${path.sep}${pageName}${path.sep}${file}`);
							fs.copyFileSync(filePath, newFilePlace);
						}
						fs.rmSync(filePath);
					}
				}
			});
			console.log('The files are moved to the dist!');
		}
	};
};

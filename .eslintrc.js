module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2021: true
	},
	extends: 'eslint-config-server-shiwaforce',
	overrides: [
	],
	parserOptions: {
		ecmaVersion: 'latest'
	},
	rules: {
		'max-lines': ['error', 300],
		'max-len': ['error', { code: 160 }]
	}
};

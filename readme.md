# Vite Plugin Shiwaforce MPA

This is a Vite Plugin for Multi Page applications.
Import it and use it.

## Import

## Config:

```javascript
export default defineConfig({
	plugins: [
		vue(),
		mpa(),
		terser({
			format: {
				comments: false
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	}
});
```
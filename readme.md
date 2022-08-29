# Vite Plugin Shiwaforce MPA

This is a Vite Plugin for Multi Page Applications.

## Install
```sh
npm i -D vite-plugin-shiwaforce-mpa
```
## Usage
Import the package from the top of your file
```javascript
import mpa from 'vite-plugin-shiwaforce-mpa';
```

extend your plugins in the vite.config.js with the `mpa()` plugin.
```javascript
plugins: [
	mpa()
],
```
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
	mpa(interceptor = null, serverConfigurations = [], userConfig = {})
],
```

### Interceptor

You can use an interceptor which works before the rewrite rule.

```javascript
function interceptor(req, res, next) {
	// access req res and next variables
}
```

### serverConfigurations

You can add any express configurations if you import it before, and pass it in as an array.

```javascript
const cookieParser = require('cookie-parser');
// ...
mpa(interceptor, [cookieParser], {}),
```
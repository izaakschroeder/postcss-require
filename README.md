# postcss-require

Load JavaScript values into your CSS. Integrates with [webpack].

## Usage

```sh
npm install --save postcss-require
```

Simple usage:

```javascript
// foo.js
module.exports = {
  color: 'green'
}
```

```css
/* foo.css */
~foo: "./foo.js";

.body {
  color: ~foo.color;
}
```

```javascript
import constants from 'postcss-require';
import postcss from 'webpack-config-postcss';
import partial from 'webpack-partial';

// webpack.config.babel.js
export default partial({
  // ...
}, postcss(webpack) {
  return [constants()];
});
```

Advanced usage with [webpack] gives you access to [webpack] resolves, loaders and more:

```javascript
// foo.js
export default {
  color: 'green'
}
```

```css
/* foo.css */
~foo: "~/some-module/foo";

.body {
  color: ~foo.color;
}
```

```javascript
import constants from 'postcss-require';
import postcss from 'webpack-config-postcss';
import partial from 'webpack-partial';

// webpack.config.babel.js
export default partial({
  // ...
},  postcss(webpack) {
  return [
    constants({
      require: (request, _, done) => {
        webpack.loadModule(request, (err, source) => {
          if (err) {
            done(err);
          } else {
            let result = null;
            try {
              result = this.exec(source, request);
              // interop for ES6 modules
              if (result.__esModule && result.default) {
                result = result.default;
              }
            } catch (e) {
              done(e);
              return;
            }
            // Don't need to call `this.addDependency` since the
            // `loadModule` function takes care of it.
            done(null, result);
          }
        });
      },
    })
  ]
})
```

TODO:
 * More tests n stuff

[postcss]: https://github.com/postcss/postcss
[webpack]: https://github.com/webpack/webpack

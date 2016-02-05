import postcss from 'postcss';
import nodepath from 'path';
import resolve from 'resolve';
import {get} from 'object-path';

const defaultRequire = (path, options, done) => {
  resolve(path, options, (err, res) => {
    if (err) {
      done(err);
    } else {
      let mod;
      try {
        /* global require */
        mod = require(res);
      } catch (e) {
        done(e);
        return;
      }
      done(null, mod);
    }
  });
};

export default postcss.plugin('postcss-require', ({
  require = defaultRequire,
} = {}) => {
  const constants = { };

  const load = (name, path, directory, done) => {
    require(JSON.parse(path), {
      basedir: nodepath.dirname(directory),
    }, (err, data) => {
      if (err) {
        done(err);
      } else {
        constants[name] = data;
        done();
      }
    });
  };

  const replace = (str) => {
    return str.replace(/~([\w]+)\.(.+)/g, (_, module, path) => {
      return get(constants[module], path);
    });
  };

  const isRelevant = (value) => {
    return value.indexOf('~') >= 0;
  };

  return (css) => {
    return new Promise((resolve, reject) => {
      let count = 0;
      const check = () => {
        if (count === 0) {
          resolve();
        }
      };
      css.walk((node) => {
        if (node.type === 'decl' && isRelevant(node.prop)) {
          const x = node.prop.slice(1);
          ++count;
          load(x, node.value, node.source.input.from, (err) => {
            --count;
            if (err) {
              reject(err);
            } else {
              check();
            }
          });
          node.remove();
        } else if (node.type === 'decl' && isRelevant(node.value)) {
          node.value = replace(node.value);
        } else if (node.type === 'rule' && isRelevant(node.selector)) {
          node.selector = replace(node.selector);
        } else if (node.type === 'atrule' && isRelevant(node.params)) {
          node.params = replace(node.params);
        }
      });
      check();
    });
  };
});

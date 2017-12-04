const compose = require('stampit');

module.exports = compose({
  init({ name, level, enabled } = {}) {
    this.name = name;
    this.level = level || 'error';
    this.enabled = enabled;
  },
});

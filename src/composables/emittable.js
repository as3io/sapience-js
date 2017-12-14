const compose = require('stampit');

module.exports = compose({
  init({ emitter } = {}) {
    this.emitter = emitter;
  },
});

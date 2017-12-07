const compose = require('stampit');
const Logger = require('../logger');

const defaultLogger = Logger({ disbled: true });

module.exports = compose({
  init({ logger } = {}) {
    this.logger = logger || defaultLogger;
  },
});

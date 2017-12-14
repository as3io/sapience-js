const compose = require('stampit');
const Logger = require('../services/logger');

const defaultLogger = Logger({ disbled: true });

module.exports = compose({
  init({ logger } = {}) {
    this.logger = logger || defaultLogger;
  },
});

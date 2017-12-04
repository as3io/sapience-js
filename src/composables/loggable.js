const compose = require('stampit');
const Logger = require('../logger');
const { stampTypeOf } = require('sapience-core').utils;

const defaultLogger = Logger({ disbled: true });

module.exports = compose({
  init({ logger } = {}) {
    this.logger = stampTypeOf(logger) === 'logger' ? logger : defaultLogger;
  },
});

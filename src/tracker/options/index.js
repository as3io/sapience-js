const compose = require('stampit');
const LoggerOptions = require('./logger');
const { DEFAULT_TRACKER_NAME } = require('../../constants');

const { assign } = Object;

module.exports = compose({
  init({ id, name, logger } = {}) {
    this.id = id;
    this.name = name || DEFAULT_TRACKER_NAME;
    this.logger = LoggerOptions(assign({}, Object(logger), { name: this.name }));
  },
});

const compose = require('stampit');
const Logger = require('../logger');
const TrackerOptions = require('./options');
const { APP_NAME } = require('../constants');

const commands = {};
const { assign } = Object;

module.exports = compose({
  init({ id, name, logger } = {}) {
    this.options = TrackerOptions({ id, name, logger });
    if (!this.options.id) {
      throw new Error(`No 'id' was provided to the ${APP_NAME} tracker named '${this.options.name}'`);
    }
    this.logger = Logger(this.options.logger);
    this.logger.dispatch('log', 'Tracker initialized');
  },
  methods: {
    /**
     * Executes a tracker command.
     *
     * @todo Polyfill promises.
     * @param {string} command The command name to execute.
     * @param {object} options The command options.
     * @return {Promise} The command result.
     */
    execute(command, options) {
      const opts = assign({}, Object(options));
      const promise = typeof commands[command] === 'function' ?
        Promise.resolve(commands[command](this, opts)) :
        Promise.reject(new Error(`The command '${command}' was not found.`));
      return this.log(promise, command, opts);
    },

    /**
     * Hooks into a command promise and logs the result or error.
     *
     * @todo Polyfill promises.
     * @param {Promise} promise
     * @param {string} command
     * @param {object} opts
     * @return {Promise}
     */
    log(promise, command, opts) {
      const msg = stage => `Command execution ${stage} for '${command}'`;
      this.logger.dispatch('log', msg('started'), opts);
      return promise.then((result) => {
        this.logger.dispatch('info', msg('complete'), result);
        return result;
      }).catch((error) => {
        this.logger.dispatch('error', msg('error'), error);
        return error;
      });
    },
  },
});

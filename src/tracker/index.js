const compose = require('stampit');
const Logger = require('../services/logger');
const TrackerOptions = require('./options');
const SessionManager = require('../user');
const Emitter = require('../services/emitter');
const { APP_NAME } = require('sapience-core').constants;

const commands = {};
const { assign } = Object;

/**
 * Hooks into a command promise and logs the result or error.
 *
 * @todo Polyfill promises.
 * @param {Logger} logger
 * @param {Promise} promise
 * @param {string} command
 * @param {object} opts
 * @return {Promise}
 */
const log = (logger, promise, command, opts) => {
  const msg = stage => `Command execution ${stage} for '${command}'`;
  logger.dispatch('log', msg('started'), opts);
  return promise.then((result) => {
    logger.dispatch('info', msg('complete'), result);
    return result;
  }).catch((error) => {
    logger.dispatch('error', msg('error'), error);
    return error;
  });
};

module.exports = compose({
  /**
   * Initializes the tracker.
   *
   * @param {object} param
   * @param {string} param.id The client identifier to use with this tracker.
   * @param {string} param.name The tracker name
   * @param {object} param.logger The logger options.
   * @param {(object|string|array)} [params.usr] Initializes the tracker with the provided
   *                                             user context.
   */
  init({
    id,
    name,
    logger,
    usr,
  } = {}) {
    this.options = TrackerOptions({ id, name, logger });
    if (!this.options.id) {
      throw new Error(`No 'id' was provided to the ${APP_NAME} tracker named '${this.options.name}'`);
    }
    this.logger = Logger(this.options.logger);
    this.logger.dispatch('info', 'Tracker initialized');

    this.emitter = Emitter({ logger: this.logger });
    this.manager = SessionManager({ usr, logger: this.logger, emitter: this.emitter });
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
      return log(this.logger, promise, command, opts);
    },
  },
});

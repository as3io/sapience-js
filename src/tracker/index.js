const compose = require('stampit');
const { DEFAULT_TRACKER_NAME } = require('sapience-core').constants;
const Logger = require('../services/logger');
// const Emitter = require('../services/emitter');
const Session = require('./session');
const resolvers = require('./resolvers');
const { Promise } = require('es6-promise');

const { assign } = Object;

module.exports = compose({
  /**
   *
   * @param {object} params
   */
  init({ id, name, debug = {} } = {}) {
    this.name = name || DEFAULT_TRACKER_NAME;
    if (!id) throw new Error(`The '${this.name}' tracker is missing the track id value.`);
    this.id = id;

    this.logger = Logger(assign({}, debug, { name: this.name }));
    // this.emitter = Emitter({ logger: this.logger });
    this.session = Session({ logger: this.logger });
    this.log('log', 'Tracker initialized.');
  },

  /**
   *
   */
  methods: {
    /**
     * Executes a command by running its corresponding resolver function.
     * If the resolver returns a non-Promise value, the command will resolve immediately.
     * If the resolver returns a Promise, the command will be resolved once that Promise
     * is fullfilled.
     *
     * If the resolver throws an `Error`, or otherwise has a Promise rejecton, the command
     * will be rejected.
     *
     * The Tracker instance will be bound to each resolver as its `this` value.
     *
     * @param {string} name The command name - corresponds to a resolver function.
     * @param {array} args The command args, which will be spread to the command.
     * @returns {Promise}
     */
    resolve(name, ...args) {
      const cmd = resolvers[name];
      return new Promise((resolve, reject) => {
        if (typeof cmd !== 'function') {
          reject(new Error(`A command resolver for '${name}' was not found.`));
        } else {
          const resolver = cmd.bind(this);
          try {
            const value = resolver(...args);
            resolve(value);
          } catch (e) {
            reject(e);
          }
        }
      }).then((v) => {
        this.log('info', `command '${name}' complete`, v);
        return v;
      }).catch((e) => {
        this.log('error', `command '${name}' error`, e);
      });
    },

    /**
     *
     * @param {string} eventName
     * @param {array} args
     */
    emit(eventName, ...args) {
      this.emitter.emit(eventName, ...args);
    },

    on(eventName, cb) {
      this.emitter.on(eventName, cb);
    },

    once(eventName, cb) {
      this.emitter.once(eventName, cb);
    },

    /**
     *
     * @param {string} level
     * @param {array} args
     */
    log(level, ...args) {
      this.logger.dispatch(level, ...args);
    },

    setLogging({ level = 'warn', enabled = true } = {}) {
      this.logger.enable(enabled);
      this.logger.setLevel(level);
    },
  },
});

const compose = require('stampit');
const EventEmitter = require('eventemitter3');
const Loggable = require('../composables/loggable');

const validateListener = (eventName, listener) => {
  if (!eventName) throw new Error('No event name was provided for the listener.');
  if (typeof listener !== 'function') throw new Error(`No callback provided for the '${eventName}' event`);
};

module.exports = compose(Loggable, {
  init() {
    this.instance = new EventEmitter();
  },
  methods: {
    /**
     *
     * @param {string} eventName
     * @param {function} listener
     */
    on(eventName, listener) {
      validateListener(eventName, listener);
      this.instance.on(eventName, listener);
      this.logger.dispatch('log', `Attached listener to event '${eventName}'`);
    },

    /**
     *
     * @param {string} eventName
     * @param {function} listener
     */
    once(eventName, listener) {
      validateListener(eventName, listener);
      this.instance.once(eventName, listener);
      this.logger.dispatch('log', `Attached one-time listener to event '${eventName}'`);
    },

    /**
     *
     * @param {*} eventName
     * @param {...object} args
     */
    emit(eventName, ...args) {
      this.logger.dispatch('log', `Emitting event '${eventName}'`, ...args);
      this.instance.emit(eventName, ...args);
    },
  },
});

const compose = require('stampit');
const EventEmitter = require('eventemitter3');
const Loggable = require('../composables/loggable');

module.exports = compose(Loggable, {
  init() {
    this.instance = new EventEmitter();
    this.logger.dispatch('log', 'Event emitter initialized');
  },
  methods: {
    /**
     *
     * @param {*} eventName
     * @param {Function} listener
     */
    on(eventName, listener) {
      this.logger.dispatch('log', `Attached listener to event '${eventName}'`);
      this.instance.on(eventName, listener);
    },

    /**
     *
     * @param {*} eventName
     * @param {...object} args
     */
    emit(eventName, ...args) {
      this.logger.dispatch('info', `Emitting event '${eventName}'`, ...args);
      this.instance.emit(eventName, ...args);
    },
  },
});

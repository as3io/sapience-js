const compose = require('stampit');
const StorageInstance = require('../storage');
const { STORAGE_PREFIX } = require('sapience-core').constants;
const Loggable = require('../composables/loggable');

const createStorageKey = suffix => `${STORAGE_PREFIX}${suffix}`;

module.exports = compose(Loggable, {
  /**
   *
   */
  init() {
    this.instances = [];
    this.logger.dispatch('log', 'Storage initialized');
  },
  methods: {
    /**
     *
     * @param {string} name
     */
    delete(name) {
      this.instance(name).delete();
      this.logger.dispatch('info', `Deleted '${name}' from storage`);
      return this;
    },

    /**
     *
     * @param {string} name
     */
    exists(name) {
      return this.instance(name).exists();
    },

    /**
     *
     * @param {string} name
     */
    instance(name) {
      const instance = this.instances[name];
      if (!instance) {
        throw new Error(`The storage instance named '${name}' does not exist.`);
      }
      return instance;
    },

    /**
     *
     * @param {string} name
     */
    refresh(name) {
      this.logger.dispatch('info', `Refreshed '${name}' in storage`);
      return this.instance(name).refresh();
    },

    /**
     *
     * @param {string} name
     * @param {object} params
     * @param {string} params.suffix The storage suffix.
     * @param {number} params.ttl The time-to-live, in minutes.
     * @param {string} [params.adapter=cascading] The storage adapter to use.
     * @param {object} [params.options] The adapter options.
     * @return {this}
     * @throws {Error} If the suffix is empty.
     */
    register(name, {
      suffix,
      ttl,
      adapter = 'Cascading',
      options,
    } = {}) {
      if (!suffix) throw new Error('The storage suffix key cannot be empty.');
      const key = createStorageKey(suffix);
      this.instances[name] = StorageInstance({
        key,
        ttl,
        adapter,
        options,
      });
      return this;
    },

    /**
     *
     * @param {string} name
     */
    retrieve(name) {
      const value = this.instance(name).retrieve();
      this.logger.dispatch('info', `Retrieved '${name}' from storage`, value);
      return value;
    },

    /**
     *
     * @param {string} name
     * @param {*} value
     */
    save(name, value) {
      this.instance(name).save(value);
      this.logger.dispatch('info', `Saved '${name}' to storage`, value);
      return this;
    },
  },
});

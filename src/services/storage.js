const compose = require('stampit');
const StorageInstance = require('../storage');
const { STORAGE_PREFIX } = require('sapience-core').constants;

const createStorageKey = suffix => `${STORAGE_PREFIX}${suffix}`;

module.exports = compose({
  /**
   *
   */
  init() {
    this.instances = [];
  },
  methods: {
    /**
     *
     * @param {string} name
     */
    delete(name) {
      this.instance(name).delete();
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
      return this.instance(name).retrieve();
    },

    /**
     *
     * @param {string} name
     * @param {*} value
     */
    save(name, value) {
      this.instance(name).save(value);
      return this;
    },
  },
});

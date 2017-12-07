const compose = require('stampit');
const storage = require('./services/storage');
const { STORAGE_PREFIX } = require('sapience-core').constants;

const createStorageKey = suffix => `${STORAGE_PREFIX}${suffix}`;

module.exports = compose({
  /**
   * @param {object} params
   * @param {string} params.suffix The storage key suffix.
   * @param {number} params.ttl The time-to-live, in minutes.
   */
  init({ suffix, ttl }) {
    this.key = createStorageKey(suffix);
    this.ttl = ttl;
    this.storage = storage;
  },
  methods: {
    /**
     * Deletes the value from storage.
     *
     * @return {this}
     */
    delete() {
      this.storage.remove(this.key);
      return this;
    },

    /**
     * Determines if the value exists in storage.
     *
     * @return {boolean}
     */
    exists() {
      const value = this.retrieve();
      if (value) return true;
      return false;
    },

    /**
     * Refreshes the current value in storage
     * by extending it's expiration.
     * If the value doesn't exist, nothing happens.
     *
     * @return {*} The refreshed value.
     */
    refresh() {
      return this.save(this.retrieve());
    },

    /**
     * Retrieves the value from storage, if it exists.
     *
     * @return {*}
     */
    retrieve() {
      return this.storage.get(this.key);
    },

    /**
     * Saves a value to storage.
     *
     * @param {*} value
     * @return {this}
     */
    save(value) {
      // Convert the TTL (in minutes) to a date object.
      const expires = new Date((new Date()).valueOf() + (this.ttl * 60 * 1000));
      this.storage.set(this.key, value, expires);
      return this;
    },
  },
});

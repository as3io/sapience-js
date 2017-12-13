const compose = require('stampit');
const adapters = require('./adapters');

module.exports = compose({
  /**
   * @param {object} params
   * @param {string} params.key The storage key.
   * @param {number} params.ttl The time-to-live, in minutes.
   * @param {string} params.adapter The storage adapter to use.
   * @param {object} [params.options] The adapter options.
   */
  init({
    key,
    ttl,
    adapter,
    options,
  }) {
    this.key = key;
    this.ttl = ttl;
    if (!adapters[adapter]) throw new Error(`No adapter was found for '${adapter}'`);
    this.adapter = adapters[adapter](options);
  },
  methods: {
    /**
     * Deletes the value from storage.
     *
     * @return {this}
     */
    delete() {
      this.adapter.remove(this.key);
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
      return this.adapter.get(this.key);
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
      this.adapter.set(this.key, value, expires);
      return this;
    },
  },
});

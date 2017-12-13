const compose = require('stampit');
const cookie = require('js-cookie');

module.exports = compose({
  /**
   *
   * @param {object} params
   * @param {string} [domain]
   */
  init({ domain }) {
    this.domain = domain || window.location.hostname;
  },
  methods: {
    /**
     *
     * @param {string} key
     * @return {*}
     */
    get(key) {
      if (!key) return undefined;
      const value = cookie.get(key);
      return value || undefined;
    },

    /**
     *
     * @param {string} key
     * @return {this}
     */
    remove(key) {
      if (!key) return this;
      cookie.remove(key);
      return this;
    },

    /**
     *
     * @param {string} key
     * @param {*} value
     * @param {Date} expires
     * @return {this}
     */
    set(key, value, expires) {
      if (!key) return this;
      if (!value) return this.remove(key);
      cookie.set(key, value, { expires, domain: this.domain });
      return this;
    },
  },
});

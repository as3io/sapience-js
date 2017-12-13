const compose = require('stampit');
const CookieAdapter = require('./cookie');
const LocalStorageAdapter = require('./local-storage');

module.exports = compose({
  init({ options = {} } = {}) {
    this.cookie = CookieAdapter(options.cookie);
    this.localStorage = LocalStorageAdapter(options.localStorage);
  },
  methods: {
    /**
     *
     * @param {string} key
     * @return {*}
     */
    get(key) {
      if (!key) return undefined;
      const value = this.cookie.get(key);
      return value || this.localStorage.get(key);
    },

    /**
     *
     * @param {string} key
     * @return {this}
     */
    remove(key) {
      if (!key) return this;
      this.cookie.remove(key);
      this.localStorage.remove(key);
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
      this.cookie.set(key, value, expires);
      this.localStorage.set(key, value, expires);
      return this;
    },
  },
});

const compose = require('stampit');

/**
 * Determines if storage is currently available, enabled, and writeable.
 *
 * @param {string} type - The storage type
 * @return {boolean}
 */
const storageAvailable = (type) => {
  try {
    const s = window[type];
    const x = '__storage_test__';
    s.setItem(x, x);
    s.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof window.DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      s.length !== 0; // eslint-disable-line no-undef
  }
};

/**
 * Gets a storage object from the window, based on type.
 * If storage is not available, will return `undefined`.
 *
 * @param {string} [type=localStorage] - The storage type.
 * @return {(WindowLocalStorage|WindowSessionStorage|undefined)}
 */
const storage = (type = 'localStorage') => (storageAvailable(type) ? window[type] : undefined);

module.exports = compose({
  methods: {
    /**
     *
     * @param {string} key
     * @return {(string|undefined)}
     */
    get(key) {
      if (!key || !storage()) return undefined;
      const json = storage().getItem(key);
      if (json) {
        try {
          const parsed = JSON.parse(json);
          if ((!parsed.v || !parsed.e) || parsed.e < (new Date()).valueOf()) {
            return undefined;
          }
          return parsed.v;
        } catch (e) {
          return undefined;
        }
      }
      return undefined;
    },

    /**
     *
     * @param {string} key
     * @return {this}
     */
    remove(key) {
      if (!key || !storage()) return this;
      storage().removeItem(key);
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
      if (!key || !storage()) return this;
      if (!value) return this.remove(key);

      storage().setItem(key, JSON.stringify({ v: value, e: expires.valueOf() }));
      return this;
    },
  },
});

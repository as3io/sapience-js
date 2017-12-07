const compose = require('stampit');
const cookie = require('js-cookie');

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
    return e instanceof DOMException && (
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

const StorageService = compose({
  methods: {
    /**
     * Retrieves a value from storage.
     * Will first attempt to find the value in a cookie.
     * If not found, will attempt to retrieve it from `localStorage`.
     * If `localStorage` is not supported, or the value is expired,
     * will return undefined.
     *
     * @param {string} key
     * @return {(string|undefined)}
     */
    get(key) {
      if (!key) return undefined;
      const value = cookie.get(key);
      if (value || !storage()) return value;
      const json = storage().getItem(key);
      if (json) {
        try {
          const parsed = JSON.parse(json);
          if ((!parsed.v || !parsed.exp) || parsed.exp < (new Date()).valueOf()) {
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
     * Removes a value from storage.
     *
     * @param {string} key
     * @return {this}
     */
    remove(key) {
      if (!key) return this;

      cookie.remove(key);
      if (storage()) storage().removeItem(key);
      return this;
    },

    /**
     * Sets a value to storage.
     * Will set to a cookie and to `localStorage`, if available.
     * If the value is `falsey` will remove the value.
     *
     * @param {string} key
     * @param {*} value
     * @param {Date} expires
     * @return {this}
     */
    set(key, value, expires) {
      if (!key) return this;
      if (!value) return this.remove(key);

      cookie.set(key, value, { expires });
      if (storage()) storage().setItem(key, JSON.stringify({ v: value, exp: expires.valueOf() }));
      return this;
    },
  },
});

module.exports = StorageService();

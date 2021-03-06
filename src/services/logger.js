const compose = require('stampit');
const { APP_NAME } = require('sapience-core').constants;

const levels = {
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
};

module.exports = compose({
  init({ level, enabled, name } = {}) {
    this.enable(enabled);
    this.setLevel(level);
    this.name = name;
  },
  properties: {
    level: levels.error,
    enabled: true,
  },
  methods: {
    dispatch(level, ...args) {
      const index = levels[level] || levels.error;
      if (this.enabled && index >= this.level) {
        args.unshift(`${APP_NAME} Logger (${this.name}) ${level}:`);
        // eslint-disable-next-line no-console
        console[level](...args);
      }
    },
    enable(bit = true) {
      this.enabled = Boolean(bit);
    },
    setLevel(level) {
      this.level = levels[level] || levels.warn;
    },
  },
});

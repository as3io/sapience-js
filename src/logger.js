const compose = require('stampit');
const { APP_NAME, DEFAULT_TRACKER_NAME } = require('./constants');

const levels = {
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
};

module.exports = compose({
  init({ level, enabled, name }) {
    this.stampType = 'logger';
    this.enable(enabled);
    this.setLevel(level);
    this.name = name || this.name;
  },
  properties: {
    name: DEFAULT_TRACKER_NAME,
    level: 4,
    enabled: true,
  },
  methods: {
    dispatch(level, ...args) {
      const index = levels[level] || 4;
      if (this.enabled && index >= this.level) {
        args.unshift(`${APP_NAME} Logger (${this.name}):`);
        // eslint-disable-next-line no-console
        console[level](...args);
      }
    },
    enable(bit = true) {
      this.enabled = Boolean(bit);
    },
    setLevel(level) {
      this.level = levels[level] || this.level;
    },
  },
});

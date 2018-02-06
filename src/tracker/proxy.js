const compose = require('stampit');
const Tracker = require('./index');

const { assign } = Object; // @todo Should this use 'object-assign'?


const run = (tracker, { resolve, reject }, name, ...args) => {
  try {
    resolve(tracker.resolve.call(tracker, name, ...args));
  } catch (e) {
    reject(e);
  }
};

module.exports = compose({
  init({ name } = {}) {
    this.name = name;
    this.queue = [];
  },
  properties: {
    loaded: false,
    loading: false,
  },
  methods: {
    /**
     *
     * @param {*} name
     * @param {*} args
     * @returns {Promise}
     */
    execute(name, args) {
      if (name === 'init' && (this.loaded || this.loading)) {
        return Promise.reject(new Error(`You can only call 'init' once on tracker '${this.name}'`));
      }
      if (name === 'init') {
        this.loading = true;
        return new Promise((resolve, reject) => {
          try {
            const initArgs = assign({}, args[0], { name: this.name });
            this.tracker = Tracker(initArgs);
            this.loaded = true;
            this.loading = false;

            resolve(this.tracker);

            this.queue.forEach(queued => run(this.tracker, ...queued));
            this.queue = [];
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.loaded) {
        return Promise.resolve(this.tracker.resolve.call(this.tracker, name, ...args));
      }
      // Defer the command's resolve/reject until the tracker is loaded.
      return new Promise((resolve, reject) => {
        this.queue.push([{ resolve, reject }, name, ...args]);
      });
    },
  },
});

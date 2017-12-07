const Tracker = require('./tracker');
const { DEFAULT_TRACKER_NAME, APP_NAME } = require('sapience-core').constants;

const { assign } = Object;
const trackers = {};

/**
 * Initializes a tracker, or runs a command on an initialized tracker.
 *
 * @todo Polyfill promises.
 * @param {string} command The command name.
 * @param {object} options The command options.
 * @return {Promise}
 */
module.exports = (command, options) => new Promise((resolve, reject) => {
  const opts = assign({}, options);
  const cmd = String(command);
  if (cmd === 'init') {
    // Create the tracker instance on init.
    const name = opts.name || DEFAULT_TRACKER_NAME;
    opts.name = name;
    if (!trackers[name]) {
      // Only create the instance once.
      try {
        trackers[name] = Tracker(opts);
        return resolve(trackers[name]);
      } catch (e) {
        return reject(e);
      }
    }
    return resolve(trackers[name]);
  }
  // Delegate the command to the appropriate tracker.
  const parts = cmd.split('.', 2);
  const params = {
    name: (parts.length === 2) ? parts[0] : DEFAULT_TRACKER_NAME,
    command: (parts.length === 2) ? parts[1] : parts[0],
  };
  const tracker = trackers[params.name];
  return tracker ? resolve(tracker.execute(params.command, opts)) : reject(new Error(`No ${APP_NAME} tracker named '${params.name}' was found.`));
});
